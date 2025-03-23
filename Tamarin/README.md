# OIDC-PnC Tamarin Model

This repository provides the Tamarin models for the paper "OAuth 2 Powered Electric Vehicle Charging" which is currently under review.

In the paper, we propose a solution for the integration of OAuth to the existing Plug and Charge (PnC) architecture. Here, we provide the Tamarin model we use for the formal security verification of the proposed solution.

## Execution Instructions

The [Tamarin prover](https://tamarin-prover.github.io/) is required to verify the model. Our files have been developed and verified with [Tamarin version 1.6.1](https://github.com/tamarin-prover/tamarin-prover/releases/tag/1.6.1). 
At the beginning of the model file, the specific command to generate the corresponding Tamarin proof(s) is given, together with its expected output and the verification times (~320min) on our test machine (a Lenovo ThinkPad T14 Gen 1 with an AMD® Ryzen 7 pro 4750u CPU and 16GB RAM), which can be used as an orientation.


In short, the security model [oidc_pnc.spthy](./oidc_pnc.spthy) can be verified with the following Tamarin command:  
`tamarin-prover --prove --quit-on-warning --auto-sources --stop-on-trace=SEQDFS --heuristic=O --oraclename=oracle  oidc_pnc.spthy +RTS -N8 -RTS`

For this to work, the [oracle](./oracle) file (which is used if `--heuristic=O` is indicated) must be located in the same folder where the command is run and must be executable (e.g., `chmod +x oracle`).
The number of threads used by Tamarin is specified by `+RTS -N<number of threads> -RTS`, which can be adjusted to improve verification times (depending on the used hardware).
By default, Tamarin prints its verification steps to the console. Note that the most important output is the **summary of summaries** at the end of execution, which should indicate that all lemmas were **verified**.
The execution time in our tests was roughly 320 minutes.


