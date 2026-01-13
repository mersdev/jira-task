# syntax=docker/dockerfile:1
# check=error=true

# Optimized multi-stage Dockerfile for Rails production deployment
# Expected final image size: ~150MB (vs ~800MB with full Debian)

ARG RUBY_VERSION=3.4.8

# Stage 1: Builder - Install gems and precompile assets
FROM docker.io/library/ruby:${RUBY_VERSION}-alpine AS builder

WORKDIR /app

ENV RAILS_ENV=production \
    BUNDLE_DEPLOYMENT=1 \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_WITHOUT="development:test"

RUN apk add --no-cache \
    build-base \
    git \
    libpq-dev \
    yaml-dev \
    pkgconfig \
    nodejs \
    yarn \
    tzdata

COPY Gemfile Gemfile.lock ./

RUN bundle install && \
    rm -rf ~/.bundle/ /usr/local/bundle/ruby/*/cache /usr/local/bundle/ruby/*/bundler/gems/*/.git

COPY . .

RUN bundle exec bootsnap precompile -j 1 --gemfile && \
    bundle exec bootsnap precompile -j 1 app/ lib/ && \
    rm -rf tmp/cache

# Stage 2: Runtime - Minimal production image
FROM docker.io/library/ruby:${RUBY_VERSION}-alpine AS production

WORKDIR /app

ENV RAILS_ENV=production

RUN apk add --no-cache \
    curl \
    libpq \
    tzdata && \
    rm -rf /var/cache/apk/*

RUN addgroup -S rails && adduser -S rails -G rails

COPY --from=builder /usr/local/bundle /usr/local/bundle
COPY --from=builder /app /app

USER rails

EXPOSE 8080

ENTRYPOINT ["/app/bin/docker-entrypoint"]

# Honor Cloud Run-provided $PORT (default 3000 locally)
CMD ["/bin/sh", "-c", "bundle exec rails server -b 0.0.0.0 -p ${PORT:-3000}"]
