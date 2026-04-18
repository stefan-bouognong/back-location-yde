CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50) NULL,
  role ENUM('visitor', 'user', 'owner') NOT NULL DEFAULT 'user',
  avatar VARCHAR(512) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  owner_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(500) NOT NULL,
  type ENUM('room', 'studio', 'apartment') NOT NULL,
  style ENUM('simple', 'modern') NOT NULL,
  furnished ENUM('furnished', 'unfurnished') NOT NULL,
  price INT UNSIGNED NOT NULL,
  location VARCHAR(255) NOT NULL DEFAULT 'Yaoundé',
  neighborhood VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  feat_water TINYINT(1) NOT NULL DEFAULT 0,
  feat_electricity TINYINT(1) NOT NULL DEFAULT 0,
  feat_wifi TINYINT(1) NOT NULL DEFAULT 0,
  feat_parking TINYINT(1) NOT NULL DEFAULT 0,
  feat_security TINYINT(1) NOT NULL DEFAULT 0,
  feat_kitchen TINYINT(1) NOT NULL DEFAULT 0,
  views INT UNSIGNED NOT NULL DEFAULT 0,
  contacts INT UNSIGNED NOT NULL DEFAULT 0,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_properties_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS property_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  property_id BIGINT UNSIGNED NOT NULL,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_property_images_property FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id BIGINT UNSIGNED NOT NULL,
  property_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, property_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_property FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE
);

CREATE INDEX idx_properties_neighborhood ON properties (neighborhood);
CREATE INDEX idx_properties_type ON properties (type);
CREATE INDEX idx_properties_price ON properties (price);
CREATE INDEX idx_properties_created ON properties (created_at);
