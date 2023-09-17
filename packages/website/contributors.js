const http = require("https");
const fs = require('node:fs');
const path = require('node:path');

const options = {
    host: 'api.github.com',
    port: 443,
    path: '/repos/Cadienvan/expirables/contributors?anon=1',
    headers: { 'User-Agent': 'request' }
};

const headerTemplate = "# Contributors\n\n|  | Login | Cointributions |\n|--|--|--|\n";
const rowTemplate = '| <img src="{%AVATAR%}&size=50" alt="{%LOGIN%}" width="50px"/> | [{%LOGIN%}]({%URL%}) | {%CONTRIB%} |\n';
const licenseTemplate = "\n## LICENSE\n\n {%LICENSE%}";

http.get(options, function (res) {
    let body = '';
    let markdown = '';

    if (res.statusCode != 200) {
        console.error(`Got response: ${res.statusCode}`);

        return;
    }

    res.on('data', (d) => body += d);

    res.on('end', function () {
        const contributors = JSON.parse(body);
        const licensePath = path.join(__dirname, '../../LICENSE');
        const license = fs.readFileSync(licensePath, 'utf8');

        markdown += headerTemplate;

        if (!license) {
            throw new Error('Unable to load license file');
        }

        console.info(`Found ${contributors.length} Users`);

        for (const contributor of contributors) {
            if (contributor.type != 'User') {
                continue;
            }

            const compiled = rowTemplate.replaceAll('{%LOGIN%}', contributor.login)
                .replaceAll('{%URL%}', contributor.html_url)
                .replaceAll('{%AVATAR%}', contributor.avatar_url)
                .replaceAll('{%CONTRIB%}', contributor.contributions);

            markdown += compiled;
        }

        markdown += licenseTemplate.replace('{%LICENSE%}', license)
            .replace('2022', new Date().getFullYear());

        fs.writeFileSync('./docs/contributors.md', markdown);
    });
}).on('error', function (e) {
    console.error("Error: " + e.message);
});