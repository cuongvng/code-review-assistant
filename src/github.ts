// const { Octokit } = require("@octokit/rest");
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
import { get } from "http";
import { getReviewFeedback as getOpenAIReview, getSummary } from "./openai";
dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function getPullRequestFiles(owner: string, repo: string, pull_number: number): Promise<[any, string]> {
    // List all files in the pull request, at the state of the latest commit
    // Then extract the latest commit id
    const fileList = await octokit.pulls.listFiles({
        owner,
        repo,
        pull_number
    });
    const data = fileList.data;
    const commitId = data[0].contents_url.split('=').pop();
    return [data, commitId];
}


export async function summarizePullRequest(owner: string, repo: string, pr_number: number) {
    const [files, commitId] = await getPullRequestFiles(owner, repo, pr_number);
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

// export async function reviewCode(owner: string, repo: string, pull_number: number) {
//     const files = await getPullRequestFiles(owner, repo, pull_number);
//     const reviews = await Promise.all(files.map(async (file) => {
//         const feedback = await getReviewFeedback(file.patch);
//         return {
//             filename: file.filename,
//             feedback
//         };
//     }));
//     return reviews;
// }

export async function createComment(owner: string, repo: string, pull_number: number, commit_id: string, body: any, path: string, start_line: number, line: number) {
    const cmt ={
        owner: owner,
        repo: repo,
        pull_number: pull_number,
        commit_id: commit_id,
        path: path,
        start_line: start_line,
        line: line, // end_line 
        body: body,
    }
    try {
        const response = await octokit.pulls.createReviewComment(cmt);
        console.log(response);
    } catch (error) {
        console.error(error);
    }
}

export async function createReview(owner: string, repo: string, pull_number: number, commit_id: string, comments: any) {
    const review ={
        owner: owner,
        repo: repo,
        pull_number: pull_number,
        commit_id: commit_id,
        body: 'This is close to perfect! Please address the suggested inline change.',
        event: 'REQUEST_CHANGES',
        comments: comments
    }
    try {
        const response = await octokit.pulls.createReview(review);
        console.log(response);
    } catch (error) {
        console.error(error);
    }
     
}

// Tests
// getPullRequestFiles("cuongvng", "srgan-pytorch", 1).then( data => {console.log(data[1])})

// getPullRequestCommits("cuongvng", "srgan-pytorch", 1).then( data => {console.log(data)})
// createComment("cuongvng", "srgan-pytorch", 1, "d8b18fe7e9a8c3f5090291fbfe75b010654042a7", "This is a test comment", "src/gen_sr.py", 11, 12)
