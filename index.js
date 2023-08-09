const { Octokit } = require("@octokit/core");

async function run() {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error("GITHUB_TOKEN is undefined")

  const octokit = new Octokit({ auth: token })

  console.log("GET /user")
  const res = await octokit.request("GET /user")
  console.dir(res.data)
}

run();