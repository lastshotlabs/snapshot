# Changelog

All notable changes to Snapshot are recorded here. Release Please updates this
file from conventional commits through a reviewed release pull request.

## [0.5.0](https://github.com/lastshotlabs/snapshot/compare/v0.4.0...v0.5.0) (2026-08-02)


### Features

* **ui:** render custom emoji in rich input ([dd41b0d](https://github.com/lastshotlabs/snapshot/commit/dd41b0d4e746d79ba7413f88096708bbc50c1626))
* **ui:** render custom emoji in rich input ([9e98e84](https://github.com/lastshotlabs/snapshot/commit/9e98e844eb74d190e5917863646829f3fcc18762))


### Bug Fixes

* **ui:** allow markdown URL transforms ([e1daa8c](https://github.com/lastshotlabs/snapshot/commit/e1daa8c23a4c569394abccaa54c4dc7b2d9db055))
* **ui:** allow markdown URL transforms ([abc12a0](https://github.com/lastshotlabs/snapshot/commit/abc12a0b6e1989fd751ebde37da20a4f23343010))

## [0.4.0](https://github.com/lastshotlabs/snapshot/compare/v0.3.1...v0.4.0) (2026-07-31)


### Features

* **cli:** complete the 0.4 adoptability toolchain ([1711546](https://github.com/lastshotlabs/snapshot/commit/1711546333812d90f18b5db344a66a539cb79331))
* **cli:** complete the 0.4 adoptability toolchain ([fd4da5d](https://github.com/lastshotlabs/snapshot/commit/fd4da5d1b2568e65ef69efd792e6f31a132f3d1f))
* **ui:** make managed confirmations adoptable ([223ed2b](https://github.com/lastshotlabs/snapshot/commit/223ed2b3387ac75da6ccdb202fe1dbfa409d4f23))
* **ui:** make managed confirmations adoptable ([253f75b](https://github.com/lastshotlabs/snapshot/commit/253f75b9caadb65a166ea54d5c31ad293e6be0f5))


### Bug Fixes

* **cli:** generate cursor pagination from OpenAPI ([d7c2fc4](https://github.com/lastshotlabs/snapshot/commit/d7c2fc43f4da8c429685fbe4a919a0ed11c819f1))
* **community:** make route contract authoritative ([168f7c3](https://github.com/lastshotlabs/snapshot/commit/168f7c366b75a3e4d557b9e5489601818cc44021))
* **community:** restore moderation POST contract ([044c204](https://github.com/lastshotlabs/snapshot/commit/044c2041b248d69349fae26967def437ece8fc64))
* **release:** keep surface-only peers optional ([5acbf84](https://github.com/lastshotlabs/snapshot/commit/5acbf84118d9128b78c028f804981b7cbd2130e1))
* **release:** keep surface-only peers optional ([f3fadc2](https://github.com/lastshotlabs/snapshot/commit/f3fadc2bd9ca8d2765008fbd35251763508415ec))

## [0.3.1](https://github.com/lastshotlabs/snapshot/releases/tag/v0.3.1) (2026-07-31)

### Bug Fixes

- Restore the deployed `POST` contract for thread lock, unlock, pin, and unpin.

## [0.3.0](https://github.com/lastshotlabs/snapshot/releases/tag/v0.3.0) (2026-07-30)

### Features

- Add registry-installed consumer validation and per-component entrypoints.
- Add a 46-component behavior, accessibility, and SSR contract test ratchet.
- Move heavy UI and tooling packages behind documented optional peer groups.

### Maintenance

- Enforce formatting in CI and align the frontend contract floor to `^0.2.2`.
- Deprecate the broken public npm 0.1.x releases.
