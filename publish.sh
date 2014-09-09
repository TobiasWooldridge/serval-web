gulp

cd dist

git init
git remote add origin git@github.com:TobiasWooldridge/serval-web.git
git add .
git commit -am "Automated distribution build"
git branch dist
git push origin dist --force
