# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
- Node runtime alignment to Node 20 for Firebase CLI and Functions deployment
- Cloud Functions deployment pipeline preparation for Sirsi Nexus App migration

## [0.8.0-beta] - 2025-09-15
### Added
- scripts/resume-migration.sh: Safe resumption script with local/prod checks, optional verification fixes, and deploy hook

### Changed
- _redirects: Removed explicit /sirsinexusportal/ redirects; retained catch-all mapping to root
- functions: Added axios ^1.12.0 to remediate GHSA-4hjh-wcwx-xvwj (CVE-2025-58754)

### Security
- Resolved Dependabot alert for axios DoS vulnerability by upgrading to >= 1.12.0


