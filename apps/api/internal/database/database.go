package database

import (
	"context"
	"fmt"
	"time"

	"careeros/api/internal/config"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func Connect(ctx context.Context, cfg config.DatabaseConfig) (*pgxpool.Pool, error) {
	poolCfg, err := pgxpool.ParseConfig(cfg.URL)
	if err != nil {
		return nil, err
	}
	poolCfg.MaxConns = cfg.MaxConns
	poolCfg.MinConns = cfg.MinConns
	poolCfg.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	var lastErr error
	for attempt := 1; attempt <= cfg.ConnectRetries; attempt++ {
		pool, err := pgxpool.NewWithConfig(ctx, poolCfg)
		if err == nil {
			if pingErr := pool.Ping(ctx); pingErr == nil {
				return pool, nil
			} else {
				lastErr = pingErr
				pool.Close()
			}
		} else {
			lastErr = err
		}
		time.Sleep(cfg.ConnectRetryDelay)
	}
	return nil, fmt.Errorf("connect postgres after %d attempts: %w", cfg.ConnectRetries, lastErr)
}

func Health(ctx context.Context, pool *pgxpool.Pool) error {
	if pool == nil {
		return fmt.Errorf("postgres pool is nil")
	}
	return pool.Ping(ctx)
}

func Close(pool *pgxpool.Pool) {
	if pool != nil {
		pool.Close()
	}
}
