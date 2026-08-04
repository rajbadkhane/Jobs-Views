package main

import (
	"context"
	"fmt"
	"log"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	_ = godotenv.Load(".env")
	raw := os.Getenv("DATABASE_URL")
	if raw == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}
	ctx := context.Background()
	dbName, adminURL, appURL, err := urls(raw)
	if err != nil {
		return err
	}

	admin, err := pgx.Connect(ctx, adminURL)
	if err != nil {
		return err
	}
	defer func() { _ = admin.Close(ctx) }()

	var exists bool
	if err := admin.QueryRow(ctx, "SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname=$1)", dbName).Scan(&exists); err != nil {
		return err
	}
	if !exists {
		if _, err := admin.Exec(ctx, `CREATE DATABASE `+pgx.Identifier{dbName}.Sanitize()); err != nil {
			return err
		}
	}

	conn, err := pgx.Connect(ctx, appURL)
	if err != nil {
		return err
	}
	defer func() { _ = conn.Close(ctx) }()

	if _, err := conn.Exec(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL)`); err != nil {
		return err
	}
	if err := applyDir(ctx, conn, "migrations", ".up.sql"); err != nil {
		return err
	}
	if err := applyDir(ctx, conn, "seeds", ".sql"); err != nil {
		return err
	}
	return nil
}

func urls(raw string) (dbName, adminURL, appURL string, err error) {
	parsed, err := url.Parse(raw)
	if err != nil {
		return "", "", "", err
	}
	dbName = strings.TrimPrefix(parsed.Path, "/")
	if dbName == "" {
		return "", "", "", fmt.Errorf("database name is required")
	}
	admin := *parsed
	admin.Path = "/postgres"
	return dbName, admin.String(), parsed.String(), nil
}

func applyDir(ctx context.Context, conn *pgx.Conn, dir, suffix string) error {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return err
	}
	names := []string{}
	for _, entry := range entries {
		name := entry.Name()
		if entry.IsDir() || !strings.HasSuffix(name, suffix) || strings.Contains(name, "rollback") {
			continue
		}
		names = append(names, filepath.Join(dir, name))
	}
	sort.Strings(names)
	for _, name := range names {
		var applied bool
		if err := conn.QueryRow(ctx, "SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE name=$1)", name).Scan(&applied); err != nil {
			return err
		}
		if applied {
			continue
		}
		sql, err := os.ReadFile(name)
		if err != nil {
			return err
		}
		tx, err := conn.Begin(ctx)
		if err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, string(sql)); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("apply %s: %w", name, err)
		}
		if _, err := tx.Exec(ctx, "INSERT INTO schema_migrations (name) VALUES ($1)", name); err != nil {
			_ = tx.Rollback(ctx)
			return err
		}
		if err := tx.Commit(ctx); err != nil {
			return err
		}
		log.Printf("applied %s", name)
	}
	return nil
}
