const { Octokit } = require("@octokit/core");

async function run() {
  console.log("Node version:", process.version)

  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error("GITHUB_TOKEN is undefined")

  const octokit = new Octokit({ auth: token })

  console.log("GET /repos/Kesin11/actions-octokit-core-v5-playground")
  const res = await octokit.request("GET /repos/Kesin11/actions-octokit-core-v5-playground")
  console.dir(res.data)
}

run();