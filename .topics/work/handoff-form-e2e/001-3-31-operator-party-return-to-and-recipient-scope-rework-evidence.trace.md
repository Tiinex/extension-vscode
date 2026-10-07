# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-10-06 20:05:01
  - Trace: [001-3-sigma-local-handoff-form-acceptance-review.trace.md](001-3-sigma-local-handoff-form-acceptance-review.trace.md)
  - Origin:
    - [relative](001-3-sigma-local-handoff-form-acceptance-review.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/302506f90537dc23d6f88ad0bd0bb9c97c6cf9f6/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-10-07 16:48:47
  - Authors: Anchor; Sigma
  - Why: Preserve the approved Operator Party design and bounded implementation evidence before the next real-host acceptance rerun.
  - Summary: Record Sigma Operator Party/Return To requirements and the Core-owned current Party scope, Authors default, To Kind and host presentation corrections.
  - Status: ready/local

---

# Operator Party Return To And Recipient Scope Rework Evidence

## Supported Claim Or Question

- Supported Claim Or Question: whether the VS Code host can replace the label-only Operator Role preference with one exact-or-explicit Operator Party preference, project Authors and Incoming recipient visibility from that preference without creating authority, expose Return To through the reusable Party/Role picker, and preserve a Core-known current Role kind when exact Handoff endpoint Reference provenance is unavailable.
- Evidence Role: Sigma human-return plus bounded implementation and regression evidence for the next local acceptance rerun.
- Target Artifact: Sigma Local Handoff Form Acceptance Review.
- Review Context: Sigma's silent-video return showed Additional Participants, Reject, carrier dimension and Accept staging materially improved. It also showed a Handoff selected as To Anchor still rendered `To Kind: unknown`, while Return To remained a raw optional field. Sigma then requested a general Operator Party picker, canonical Reference-backed setting, Authors default from the selected Party display name, and Incoming auto-preview that can include Organization scope when Core proves the Role/Organization relationship. Sigma explicitly approved None and Manual / Unknown as Operator Party modes.

## Provenance

- Known Source: Sigma screenshots/video/direct instructions, the exact carried 17-Workspace parent package, current Native Handoff schema contract, current Business Role/Organization artifacts, Core operator-context projection, focused Core regression tests, and host source probes.
- Preservation Basis: Core owns Party/Role discovery, current Role lineage, explicit Role Identity Organization metadata, endpoint qualification and recipient-scope projection. VS Code stores/presents a preference, maps Core-projected values into authoring UI, and consumes Core-projected visibility scope. No host-side membership/authority inference is introduced.
- Provenance Limits: full locked VS Code TypeScript build and human visual/interaction acceptance remain Sigma-local gates.

## Evidence Material

- Material: Operator Party setting/picker, Authors default, reusable Return To picker, To Kind preservation, Core recipient visibility scope, and ambiguity-safe Incoming preview.
- Material Kind: Human review return plus bounded implementation/regression evidence.
- Operator setting replacement: `tiinex.operator.role` and `tiinex.incoming.autoShowRoleHandoff` are removed rather than compatibility-aliased. `tiinex.operator.party` is one string preference with three explicit forms: empty = None; `unknown::<display name>` = named unknown Party; canonical Core-discovered selection = exact Workspace-qualified artifact target such as `business::.topics/roles/...trace.md`.
- Setting validation: VS Code configuration accepts only empty, named unknown, or `workspace::.topics/<artifact path>` shapes. A canonical value that no longer resolves against the current Core-projected Party surface becomes unresolved rather than falling back to label matching.
- Operator Party picker: `Tiinex: Pick Operator Party` uses the same shared Workspace/kind grouping as the other Party/Role pickers. It exposes None, Manual / Unknown, current Core-projected Roles and Party artifacts. Canonical selections persist the candidate target; Manual / Unknown prompts for a display name and persists `unknown::<name>` with no Reference or inferred scope.
- Action placement: VS Code extensions can contribute actions to an individual `view/title`, not the Activity view-container title. The account-icon action is therefore contributed once to the top-most Discovery view title and placed at the right edge of that action group, with the same command available through normal command invocation.
- Current Role discipline: Role candidates remain Core lineage-leaf projections; historical Role parents are not reintroduced by Operator Party. Party subtype presentation is derived from schema identity (Organizations, Groups, People, Parties) rather than filenames.
- Authors default: new generic artifact authoring resolves Operator Party at submission time. Resolved canonical Party/Role and Manual / Unknown use the resolved display name as the Envelope Current `Authors` default. None/unresolved supply no operator author default. `Authors` remains authorship only and does not create From/To, holder or transfer authority.
- To Kind correction: reusable Party-reference fill semantics now preserve the Core-known candidate kind independently from exact endpoint Reference provenance. A current Anchor Role authoring-assist selection writes `To: Anchor` plus `To Kind: role` while leaving `To Reference` absent. Exact candidates still preserve their exact Reference. The host does not upgrade authoring-assist provenance.
- Package-local endpoint Role closure retained: selected From/To Role metadata continues to carry exact Workspace/path identity separately for Core requalification during Pack, so the provenance-honest missing Markdown Reference does not force the Role back to unknown or require partial packaging.
- Return To semantics: the Native Handoff authoring companion now declares Return To as the same generic `qualified-party-artifacts` reference-picker used by From/To, with only `Return To Reference` as its fill. The underlying schema guide independently confirms Completion Expectation requires Signal Kind/Meaning and optionally exposes Return To and Return To Reference; it does not define Return To Kind.
- Return To UI behavior: Return To renders with From/To in the smart endpoint-control area; raw Return To/Reference fields are hidden unless Manual is chosen. Exact Return To candidates preserve an exact Reference. Authoring-assist/manual candidates preserve only the completion recipient label and do not claim endpoint-role material or invent a Return To Kind.
- No global Return To default: VS Code does not assume Return To = From. Transition/Core authoring defaults remain the appropriate future authority when a specific Transition means "return result to sender"; Signal Kind `none` remains free of fabricated return semantics.
- Core Party display projection: Role authoring label comes from Role Identity / Role Label. Organization/Group/Person/Party display labels come from their schema-owned identity sections. Role Identity / Organization and Group Identity / Organization are exposed as explicit association metadata for bounded projection.
- Core recipient visibility scope: `projectOperatorPartyScopes` returns one presentation-only scope per current authoring candidate. A Role can include one same-Workspace Organization only when its explicit Role Identity Organization label resolves uniquely to that Organization artifact. An Organization can include current Roles in the same Workspace whose explicit Organization metadata matches it. Groups/People/other Parties remain self-only unless Core later gains a stronger declared scope relation.
- Ambiguity behavior: same-Workspace duplicate Organization labels fail closed. Recipient display labels that also resolve to candidate targets outside the selected scope are removed from label matching and reported as ambiguities, preventing cross-Workspace same-name visibility from being guessed by the host.
- Actual Core projection: across the carried 17 workspace roots, operator context is ready/clean with ten current Party/Role authoring candidates and ten Operator Party scopes. Sigma projects recipient labels `Sigma, Tiinex`; Anchor projects `Anchor, Tiinex`; Tiinex Organization projects `Anchor, Axiom, Glimmer, Kodax, Loom, Pilot, Prism, Sigma, Tiinex`. Both current Prism targets remain in recipientTargets even though the presentation label dedupes to Prism.
- Incoming auto-preview: `tiinex.incoming.autoShowPartyHandoff` uses only Core-projected recipient labels for canonical Operator Party. Manual / Unknown has only its exact display label; None/unresolved has no automatic scope. Matching controls preview/reveal only and grants no Receive/Role/Party authority.
- Landing route preference: the same projected recipient-label set is used only as a preferred grounding route presentation. No match falls back to all qualified routes instead of blocking semantic Receive authority.
- Guided Entry: exact selected canonical Operator Party is suggested by Workspace/path when it is a Role. It is not rediscovered by name and does not change Core participant qualification.
- Schema-generic reuse: Party/Role discovery remains one shared Core operator-context surface used by Handoff authoring, Operator Party, Guided Entry and Additional Participants; hosts group/present it without independently determining current Role lineage.
- Core regression: operator-context Workspace/scope tests pass 4/4 including ambiguous Organization fail-closed behavior; endpoint Role/route binding passes 8/8; Handoff participant projection passes 2/2; recipient/return UX passes 18/18; Handoff Package V1 passes 43/43. Focused total: 75/75.
- Host verification: all changed TypeScript sources transpile without syntax diagnostics; changed Core/Native JavaScript parses; package.json/test source parse; a direct helper probe confirms authoring-assist Role kind preservation, absent false Reference, exact Return To nesting, no Return To Kind, and Party-scope route preference.

## Preservation And Fidelity

- Preservation State: local implementation plus this Evidence; no commit/push/publication has occurred.
- Fidelity Notes: canonical Operator Party uses Core's exact Workspace-qualified artifact coordinate as a preference identity, not as proof that every Party has exact provider provenance. `authoring-assist` remains visible as such. Scope is explicitly presentation-only.
- Known Losses: the exact account-icon placement, Settings rendering, picker interactions, Authors rendering in a newly created artifact, Return To ergonomics, To Kind preview and Incoming organization-scope auto-open require Sigma's real VS Code host.

## Interpretation Limits

- Not Yet Used As: Sigma PASS, landing authority, commit/push authority, release readiness, Marketplace readiness, organization delegation authority, or Task closure.
- Does Not Prove: that Organization membership delegates work, that a Role may act on behalf of an Organization, or that Party scope is semantic recipient authority. It only projects recipient visibility from explicit current material.
- Must Not Be Treated As: permission for VS Code to infer membership from Workspace co-location, filenames, names alone, chronology, or stale Role parents.
- Need For Review: run the locked local build, exercise None/Manual/canonical Operator Party selection, inspect stored setting and Authors default, create Handoffs using Anchor and Return To pickers, and exercise Incoming preview with Role↔Organization recipient scope before returning PASS or exact bounded rework.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-3-sigma-local-handoff-form-acceptance-review.trace.md](001-3-sigma-local-handoff-form-acceptance-review.trace.md)
  - Value: lFKPnCPOIa8UmsuSyZNwu4GsXetEL7di8iVDEzgqhv8

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: RpBVAA50uBaN7Km6SvAZk6uxg51R40FIplMo7KPCjH4