---
name: Oneshot Vision
description: Orchestrator CLI that unifies bunshot (backend) + snapshot (frontend) + infra into a single full-stack DX
type: project
---

## What It Is
`@lastshotlabs/oneshot` — thin orchestrator CLI that sits on top of bunshot + snapshot + bunshot-infra. One config, one CLI, full-stack app.

## Key Decision
Bunshot and snapshot remain separate packages. Oneshot is a layer on top — config splitter + validator + process orchestrator. No framework logic lives in oneshot.

## Name Origin
LastShot Labs → oneshot. "One shot to get a full-stack app running."

## Status
Vision stage. Snapshot needs to be solid first. Oneshot is the next project.
