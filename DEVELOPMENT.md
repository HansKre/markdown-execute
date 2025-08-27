# Notes for DEVELOPMENT

## Development

1. Setup VS Code

   ```sh
   git clone git@github.com:HansKre/markdown-execute.git
   cd markdown-execute
   npm install
   code .
   ```

1. Then, inside the editor, click `Run > Start Debugging` or press `F5`.
   This will compile and run the extension in a new **Extension Development Host window**.
1. Inside of your first editor window, you will have a `watch`-task running.
   This task will compile the extension and run it in the background. In the new **Extension Development Host window** you can open any `markdown` file and execute commands on the terminal through the `markdown-execute`-extension.

## Publishing

Official how-to publish extensions to VS Code Extension Marketplace [here](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).

Visual Studio Code uses Azure DevOps for its Marketplace services.

Publishing happens using `vsce`, the CLI tool for managing VS Code extensions.

### Initial Setup

1. Create an Azure DevOps account
2. [Get an Azure DevOps Personal Access Token](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token)
3. Create a publisher
4. Install `vsce`-CLI

   ```sh
       npm install -g @vscode/vsce
   ```

5. Login `vsce` with your publisher

   ```sh
       vsce login <publisher name>
       # provide your personal access token (to paste, right-click into terminal)
       # login at https://dev.azure.com if your current token expired to create a new one
   ```

### Publish a new version

You can auto-increment an extension's version number when you publish by specifying the SemVer compatible number to increment: `major`, `minor`, or `patch`: `vsce publish major`

This will modify the extension's `package.json` version attribute before publishing the extension.

You can also specify a complete SemVer compatible version on the command line: `vsce publish 2.0.1`

If vsce publish is run in a git repo, it will also create a version commit and tag via npm-version. The default commit message will be extension's version, but you can supply a custom commit message using the `-m` flag. (The current version can be referenced from the commit message with `%s`.)

```sh
# first: update release notes by referencing the next version
# commit all changes
# no need to package by running: vsce package, since this would
# generate <extenstion-name>.vsix with old version number
# instead, from extension root run:
vsce publish patch
# this bumps the version number, creates git tag and commit
# after that, it publishes to VS Code Marketplace as <publisherID>.<extension-name>
git push
```

### Publishing manually

If you cannot publish, e.g. due to expired PAT, you can also package and upload manually by running

```sh
vsce package
```

Go to the [marketplace](https://marketplace.visualstudio.com/manage/publishers/hanskre) and login.
Click the "..." next to the Extension-Name and "Update". Upload the `.vsix`-file.

## Configuration

VSCode will display commands in Shortcuts-menu, even if they are not registered in the `package.json`. Hence, they will lack a description / title. So it could be better to provide it proactively.

```json
"contributes": {
    "commands": [
      {
        "command": "markdown-execute.sayHello",
        // this title is shown in the VS Code command palette
        // and also in Shortcuts menu
        "title": "Hello from Markdown Execute"
      }
    ],
    ...
}
```

## Activation Events

### `[onCommand](https://code.visualstudio.com/api/references/activation-events#onCommand)`

Whenever a command, e.g. `markdown-execute.sayHello` is being invoked, this activation **event** is emitted and interested **other** extensions will be activated (pub-sub pattern):

```json
"activationEvents": [
    "onCommand:markdown-execute.sayHello"
]
```

## Extension Guidelines

[link](https://code.visualstudio.com/api/references/extension-guidelines)

## Screen Recording

- Quicktime on mac, export to 480p
- Use [ezgif](https://ezgif.com/video-to-gif) to speedup 3x and convert to gif

## Testcases / Commands for testing (examples of code blocks in markdown)

### Login to jenkins and execute for-loop

```bash
   export jenkins=ec2-3-122-205-211.eu-central-1.compute.amazonaws.com
   ssh -i ./udemy-devops-project/follow/secrets/aws-jenkins.pem ec2-user@$jenkins
   ip4=$(/sbin/ip -o -4 addr list eth0 | awk '{print $4}' | cut -d/ -f1)
   for i in {1..3}
   do
      echo "Foo $ip4 $i"
   done
   exit
```

### Shell

```sh
   export jenkins=ec2-3-122-205-211.eu-central-1.compute.amazonaws.com
   echo $jenkins
```

### Should not annotate

```json
{
  "foo": "bar"
}
```

### Excaping of special chars in js

```js
let i = 12;
console.log("ab$cd");
console.log("ab$$cd");
console.log("sdfdsgdfg");
console.log(`ab${i}cd`);
console.log(`three spaces   in a row`);
```

Expected output:

```output
node -e "let i = 12;
dquote> console.log('ab\$cd');
dquote> console.log('ab\$\$cd');
dquote> console.log('sdfdsgdfg');
dquote> console.log(\`ab\${i}cd\`);
dquote> "
ab$cd
ab$$cd
sdfdsgdfg
ab12cd
three spaces   in a row
```

### Simple Python

```python
print("it works")
```

### Python identation

```python
def say_hello(name):
  print(f'Hello {name}')
say_hello('World')
```

### SSH into machine

```sh
   ssh -i ./udemy-devops-project/follow/secrets/aws-jenkins.pem ec2-user@$jenkins
```

### Become root

```sh
   sudo su -
```

### Change hostname & reboot

```sh
   # either
   hostnamectl set-hostname jenkins
   # or: echo "jenkins" > /etc/hostname
   # confirm
   cat /etc/hostname
   # reboot
   reboot
```

### SSH back into machine

```sh
   # wait for reboot
   sleep 30
   ssh -i ./udemy-devops-project/follow/secrets/aws-jenkins.pem ec2-user@$jenkins
   sudo su -
```

### Update OS

```sh
   yum update -y && yum upgrade -y
```

### Install Jenkins and Java 11

```sh
   # add redhat-jenkins-repo
   wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
   # add jenkins package public key
   rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
   # install repository that provides 'daemonize'
   amazon-linux-extras install epel -y
   # install jdk
   amazon-linux-extras install java-openjdk11 -y
   # test jdk installation
   java --version
   # install jenkins
   yum install jenkins -y
```

## Testing available Terminals

1. Press `F5` to start a new VSCode-Instance for debugging
2. Create some terminal-instances (e.g. create one by sending new execution to it)
3. Close the debugging-instance
4. Repeat with #1
5. Debugging out goes to the "DEBUG CONSOLE" of the parent-VSCode-Instance
