// const { Octokit } = require("@octokit/rest");
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
import { get } from "http";
import { getReviewFeedback, getSummary } from "./openai";
dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function getPullRequestFiles(owner: string, repo: string, pull_number: number) {
    const data = await octokit.pulls.listFiles({
        owner,
        repo,
        pull_number
    });
    return data;
}

export async function summarizePullRequest(owner: string, repo: string, pr_number: number) {
    const files = await getPullRequestFiles(owner, repo, pr_number);
    const summaries = await Promise.all(files.map( async (file) => {
        const summary = await getSummary(file.patch); // TODO: Implement getSummary with OpenAI
        return  {
            filename: file.filename,
            summary: summary
        }
    })).catch((error) => {console.error(error)});
    console.log(summaries)
    return summaries;
}

export async function reviewCode(owner: string, repo: string, pull_number: number) {
    const files = await getPullRequestFiles(owner, repo, pull_number);
    const reviews = await Promise.all(files.map(async (file) => {
        const feedback = await getReviewFeedback(file.patch);
        return {
            filename: file.filename,
            feedback
        };
    }));
    return reviews;
}


// Tests
// getPullRequestFiles("cuongvng", "neural-networks-with-PyTorch", 11).then( data => {console.log(data)})

