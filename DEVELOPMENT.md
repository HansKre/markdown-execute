# Notes for DEVELOPMENT

## Publishing Extensions

[link](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

### Installation and Setup

1. Get a Personal Access Token
2. Create a publisher
3. Login with publisher

   ```sh
       vsce login <publisher name>
       # provide your personal access token
   ```

4. Install `vsce`

   ```sh
       npm install -g vsce
   ```

### Publishing

You can auto-increment an extension's version number when you publish by specifying the SemVer compatible number to increment: `major`, `minor`, or `patch`: `vsce publish major`

This will modify the extension's `package.json` version attribute before publishing the extension.

You can also specify a complete SemVer compatible version on the command line: `vsce publish 2.0.1`

If vsce publish is run in a git repo, it will also create a version commit and tag via npm-version. The default commit message will be extension's version, but you can supply a custom commit message using the `-m` flag. (The current version can be referenced from the commit message with `%s`.)

```sh
# first: update release notes!
# from extension root
vsce package
# <extenstion-name>.vsix generated
vsce publish patch
# <publisherID>.<extension-name> published to VS Code Marketplace
```

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

### Markdown snippets for screen recording

#### Login to jenkins and execute for-loop

Mollit anim eu est proident incididunt quis ad. Elit quis ullamco magna. Ipsum culpa est laborum excepteur tempor excepteur exercitation `console.log("Foo Bar from Node")` ipsum enim reprehenderit excepteur cillum. Ut in aliquip aute nisi excepteur mollit non `echo "Foo Bar from Shell"` exercitation proident.

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

## Configure EC2 OS

1. Export public ip of instance

   ```sh
      export jenkins=ec2-3-122-205-211.eu-central-1.compute.amazonaws.com
   ```

2. SSH into machine

   ```sh
      ssh -i ./udemy-devops-project/follow/secrets/aws-jenkins.pem ec2-user@$jenkins
   ```

3. Become root

   ```sh
      sudo su -
   ```

4. Change hostname & reboot

   ```sh
      # either
      hostnamectl set-hostname jenkins
      # or: echo "jenkins" > /etc/hostname
      # confirm
      cat /etc/hostname
      # reboot
      reboot
   ```

5. SSH back into machine

   ```sh
      # wait for reboot
      sleep 30
      ssh -i ./udemy-devops-project/follow/secrets/aws-jenkins.pem ec2-user@$jenkins
      sudo su -
   ```

6. Update OS

   ```sh
      yum update -y && yum upgrade -y
   ```

7. Install Jenkins and Java 11:

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
