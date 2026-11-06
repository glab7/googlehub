// Command server serves the Orbita landing page and its JSON API.
//
// The app catalog and pricing are read from <web>/data/catalog.json (web/public/data in source), the same
// file the Cloudflare Pages Functions and the static fallback use. Leads from
// the contact form are written to Firebase Firestore when FIREBASE_PROJECT_ID
// is set, and kept in memory otherwise.
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/mail"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

type App struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Category string `json:"category"`
	Color    string `json:"color"`
	Tagline  string `json:"tagline"`
}

type Plan struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Monthly     float64  `json:"monthly"`
	Yearly      float64  `json:"yearly"`
	Description string   `json:"description"`
	Features    []string `json:"features"`
	Highlight   bool     `json:"highlight"`
}

type Catalog struct {
	Categories []string `json:"categories"`
	Apps       []App    `json:"apps"`
	Plans      []Plan   `json:"plans"`
}

type Lead struct {
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Company   string    `json:"company"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"createdAt"`
}

// Limits mirror the validation in firestore.rules.
const (
	maxName    = 120
	maxEmail   = 200
	maxCompany = 120
	maxMessage = 2000
)

func loadCatalog(path string) (*Catalog, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var c Catalog
	if err := json.Unmarshal(b, &c); err != nil {
		return nil, fmt.Errorf("parse %s: %w", path, err)
	}
	return &c, nil
}

// LeadStore persists contact-form submissions.
type LeadStore interface {
	Add(ctx context.Context, l Lead) (string, error)
}

type memoryStore struct {
	mu    sync.Mutex
	leads []Lead
}

func (s *memoryStore) Add(_ context.Context, l Lead) (string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.leads = append(s.leads, l)
	return fmt.Sprintf("mem-%d", len(s.leads)), nil
}

// firestoreStore writes leads through the Firestore REST API. Access is
// governed by firestore.rules, which allow create-only writes to /leads.
type firestoreStore struct {
	projectID string
	apiKey    string
	client    *http.Client
}

func (s *firestoreStore) Add(ctx context.Context, l Lead) (string, error) {
	str := func(v string) map[string]string { return map[string]string{"stringValue": v} }
	doc := map[string]any{"fields": map[string]any{
		"name":      str(l.Name),
		"email":     str(l.Email),
		"company":   str(l.Company),
		"message":   str(l.Message),
		"source":    str("go-server"),
		"createdAt": map[string]string{"timestampValue": l.CreatedAt.Format(time.RFC3339Nano)},
	}}
	body, err := json.Marshal(doc)
	if err != nil {
		return "", err
	}

	endpoint := fmt.Sprintf("https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/leads",
		url.PathEscape(s.projectID))
	if s.apiKey != "" {
		endpoint += "?key=" + url.QueryEscape(s.apiKey)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	res, err := s.client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		msg, _ := io.ReadAll(io.LimitReader(res.Body, 2048))
		return "", fmt.Errorf("firestore: %s: %s", res.Status, msg)
	}
	var created struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(res.Body).Decode(&created); err != nil {
		return "", err
	}
	return filepath.Base(created.Name), nil
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("encode response: %v", err)
	}
}

func handleApps(c *Catalog) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		category := r.URL.Query().Get("category")
		q := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
		out := make([]App, 0, len(c.Apps))
		for _, a := range c.Apps {
			if category != "" && category != "All" && a.Category != category {
				continue
			}
			if q != "" && !strings.Contains(strings.ToLower(a.Name+" "+a.Tagline), q) {
				continue
			}
			out = append(out, a)
		}
		writeJSON(w, http.StatusOK, map[string]any{"categories": c.Categories, "apps": out})
	}
}

func handlePlans(c *Catalog) http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, c.Plans)
	}
}

func handleContact(store LeadStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 16<<10)
		var l Lead
		if err := json.NewDecoder(r.Body).Decode(&l); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
			return
		}
		l.Name = strings.TrimSpace(l.Name)
		l.Email = strings.TrimSpace(l.Email)
		l.Company = strings.TrimSpace(l.Company)
		l.Message = strings.TrimSpace(l.Message)
		switch {
		case l.Name == "" || len(l.Name) > maxName:
			writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": "name is required"})
			return
		case len(l.Email) > maxEmail:
			writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": "email is too long"})
			return
		case len(l.Company) > maxCompany || len(l.Message) > maxMessage:
			writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": "company or message is too long"})
			return
		}
		if _, err := mail.ParseAddress(l.Email); err != nil {
			writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": "a valid email is required"})
			return
		}
		l.CreatedAt = time.Now().UTC()

		ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
		defer cancel()
		id, err := store.Add(ctx, l)
		if err != nil {
			log.Printf("store lead: %v", err)
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "could not save your request, please try again"})
			return
		}
		log.Printf("new lead %s: %s <%s>", id, l.Name, l.Email)
		writeJSON(w, http.StatusCreated, map[string]any{"ok": true, "id": id})
	}
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func logRequests(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start).Round(time.Microsecond))
	})
}

func main() {
	addr := flag.String("addr", ":8080", "listen address")
	webDir := flag.String("web", "../web/out", "static site to serve (the Next.js export in web/out)")
	flag.Parse()

	if port := os.Getenv("PORT"); port != "" {
		*addr = ":" + port
	}

	catalog, err := loadCatalog(filepath.Join(*webDir, "data", "catalog.json"))
	if err != nil {
		log.Fatalf("load catalog: %v", err)
	}

	var store LeadStore = &memoryStore{}
	if pid := os.Getenv("FIREBASE_PROJECT_ID"); pid != "" {
		store = &firestoreStore{
			projectID: pid,
			apiKey:    os.Getenv("FIREBASE_API_KEY"),
			client:    &http.Client{Timeout: 10 * time.Second},
		}
		log.Printf("leads -> Firestore project %s", pid)
	} else {
		log.Printf("leads -> memory (set FIREBASE_PROJECT_ID to use Firestore)")
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/apps", handleApps(catalog))
	mux.HandleFunc("GET /api/plans", handlePlans(catalog))
	mux.HandleFunc("POST /api/contact", handleContact(store))
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.Handle("GET /", http.FileServer(http.Dir(*webDir)))

	srv := &http.Server{
		Addr:              *addr,
		Handler:           logRequests(withCORS(mux)),
		ReadHeaderTimeout: 5 * time.Second,
	}
	log.Printf("Orbita listening on http://localhost%s (serving %s)", *addr, *webDir)
	log.Fatal(srv.ListenAndServe())
}
