FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Add .js extensions to imports in compiled dist for ESM
RUN node << 'EOF'
const fs = require('fs');
const path = require('path');
function processDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/from ["']([.\/][^"']+)["']/g, (match, importPath) => {
        if (!importPath.endsWith('.js') && !importPath.endsWith('.json')) {
          return `from "${importPath}.js"`;
        }
        return match;
      });
      fs.writeFileSync(fullPath, content);
    }
  });
}
processDir('./dist');
console.log('Added .js extensions to imports');
EOF

EXPOSE 4000

CMD ["npm", "start"]
