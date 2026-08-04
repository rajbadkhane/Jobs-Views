package cache

import (
	"context"
	"fmt"
	"time"

	"careeros/api/internal/config"
	"github.com/redis/go-redis/v9"
)

func Connect(ctx context.Context, cfg config.RedisConfig) (*redis.Client, error) {
	options, err := redis.ParseURL(cfg.URL)
	if err != nil {
		return nil, err
	}

	client := redis.NewClient(options)
	var lastErr error
	for attempt := 1; attempt <= cfg.ConnectRetries; attempt++ {
		if err := client.Ping(ctx).Err(); err == nil {
			return client, nil
		} else {
			lastErr = err
		}
		time.Sleep(cfg.ConnectRetryDelay)
	}
	_ = client.Close()
	return nil, fmt.Errorf("connect redis after %d attempts: %w", cfg.ConnectRetries, lastErr)
}

func Health(ctx context.Context, client *redis.Client) error {
	if client == nil {
		return fmt.Errorf("redis client is nil")
	}
	return client.Ping(ctx).Err()
}

func Close(client *redis.Client) error {
	if client == nil {
		return nil
	}
	return client.Close()
}
