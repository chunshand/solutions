
const axios = require('axios');
const https = require('https');
const fs = require('fs');

const agent = new https.Agent({
    rejectUnauthorized: false
});
let Topic = [];
let IssuesMap = {

};
async function handleGetIssues(page = 1) {
    console.log("[action]:handleGetIssues");
    let params = {
        'state': 'all',
        'fields': 'title,number',
        "per_page": 100,
        "page": page
    }
    let res = await axios.get('https://api.github.com/repos/chunshand/solutions/issues', { httpsAgent: agent, params })
    let arr = res.data.map((item) => {
        return {
            url: item.html_url,
            title: item.title,
        }
    })
    return arr;
}
function handleMap(data) {
    console.log("[action]:handleMap");
    data.forEach(item => {
        let a1 = item.title.search(/\[/)
        let a2 = item.title.search(/\]/)
        item.topic = item.title.slice(a1 + 1, a2)
        item.title = item.title.slice(a2 + 1)
        if (!IssuesMap[item.topic]) {
            IssuesMap[item.topic] = [];
            Topic.push(item.topic);
        }
        IssuesMap[item.topic].push(item);
    });
}
function exportMd() {
    console.log("[action]:exportMd");
    let content = '';
    Topic.forEach((topic) => {
        if (IssuesMap[topic]) {
            content += `\r\n**${topic}**\r\n`
            IssuesMap[topic].forEach((item) => {
                content += `- [${item.title}](${item.url})\r\n`
            })
        }

    })
    const tpl_data = fs.readFileSync('./README.TPL.md')
    content = String(tpl_data).replace("{{CONTENT}}", content)
    fs.writeFileSync('./README.md', content)
}
async function run() {
    console.log("[action]:run");
    IssuesMap = {};
    let page = 1;
    while (page > 0) {
        let data = await handleGetIssues(page)
        page++
        if (data.length == 0) {
            page = 0
            exportMd();
        } else {
            handleMap(data);
        }
    }
}

run()