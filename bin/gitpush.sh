#/bin/bash

if [ ! -n "$1" ]; then
    echo -e "\e[31mPlease input git message\e[0m"
    exit 0
fi

echo -e "\n\e[33mFormating all source files by prettier\e[0m"
npm run format
if [ $? != 0 ]; then
    exit 0
fi

echo -e "\n\e[33mChecking all sources by eslint\e[0m"
npm run lint
if [ $? != 0 ]; then
    exit 0
fi

echo -e "\n\e[33mSyncing from git repository\e[0m"
git pull
if [ $? != 0 ]; then
    exit 0
fi

git add .
if [ $? != 0 ]; then
    exit 0
fi

git commit -m $1
if [ $? != 0 ]; then
    exit 0
fi

git push
if [ $? != 0 ]; then
    exit 0
fi

echo -e "\n\e[33mSync sucess\e[0m"