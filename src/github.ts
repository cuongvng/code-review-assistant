// const { Octokit } = require("@octokit/rest");
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
import { get } from "http";
import { getOpenAIReview } from "./openai";
dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function getPullRequestFiles(owner: string, repo: string, pull_number: number) {
    // List all files in the pull request, at the state of the latest commit
    // Then extract the latest commit id
    const fileList = await octokit.pulls.listFiles({
        owner,
        repo,
        pull_number
    });
    const data = fileList.data;
    // const commitId = data[0].contents_url.split('=').pop();
    return data;
}

export async function createReview(owner: string, repo: string, pull_number: number, comments: any) {
    const comment ={
        owner: owner,
        repo: repo,
        issue_number: pull_number,
        body: comments,
    }
    try {
        const response = await octokit.issues.createComment(comment);
        console.log(response);
    } catch (error) {
        console.error(error);
    }
     
}

export async function main(owner: string, repo: string, pull_number: number) {
    try{
        const files = await getPullRequestFiles(owner, repo, pull_number);
        var prompt = "";
        for (const file_data of files) {
            const filename = file_data.filename;
            const patch = file_data.patch;
            prompt += `Filename: ${filename}\n`;
            prompt += `Patch: ${patch}\n\n`;
        }
        console.log("Prompt:\n", prompt);

        const comments = await getOpenAIReview(prompt);
        console.log(comments);
        await createReview(owner, repo, pull_number, comments);
    } catch (error) {
        console.error(error);
    }
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

// export async function createComment(owner: string, repo: string, pull_number: number, commit_id: string, body: any, path: string, start_line: number, line: number) {
//     if (start_line == line) { // single line comment, expand to multi-line.
//         line += 1;
//     }
//     const cmt ={
//         owner: owner,
//         repo: repo,
//         pull_number: pull_number,
//         commit_id: commit_id,
//         path: path,
//         start_line: start_line,
//         line: line, // end_line 
//         body: body,
//     }
//     try {
//         const response = await octokit.pulls.createReviewComment(cmt);
//         console.log(response);
//     } catch (error) {
//         console.error(error);
//     }
// }

// main("cuongvng", "srgan-pytorch", 1);