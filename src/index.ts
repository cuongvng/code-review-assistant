import express from 'express';
import bodyParser from 'body-parser';
import { main } from './github';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    const event = req.headers['x-github-event'];
    if (event === 'pull_request' && req.body.action === 'opened') {
        const { owner, repo } = req.body.repository;
        const pull_number = req.body.number;
        try {
            await main(owner.login, repo.name, pull_number);
            res.status(200).send('Pull request processed');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error processing pull request');
        }
    } else {
        res.status(200).send('Event ignored');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});