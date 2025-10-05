# Test Cases for Markdown Execute Extension

This file contains all the minimal test cases from the requirements.

## Login to jenkins and execute for-loop

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

## Shell

```sh
export jenkins=ec2-3-122-205-211.eu-central-1.compute.amazonaws.com
echo $jenkins
```

## Should not annotate

```json
{
  "foo": "bar"
}
```

## Escaping of special chars in js

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

## Simple Python

```python
print("it works")
```

## Python indentation

```python
def say_hello(name):
  print(f'Hello {name}')
say_hello('World')
```

## Simple TypeScript

```ts
console.log("TypeScript works")
```

## TypeScript with types

```typescript
const greet = (name: string): void => {
  console.log(`Hello ${name}`)
}
greet('World')
```

## TypeScript with escaping

```ts
let i = 42;
console.log("ab$cd");
console.log(`value: ${i}`);
```

## SSH into machine

```sh
ssh -i ./udemy-devops-project/follow/secrets/aws-jenkins.pem ec2-user@$jenkins
```

## Become root

```sh
sudo su -
```

## Change hostname & reboot

```sh
# either
hostnamectl set-hostname jenkins
# or: echo "jenkins" > /etc/hostname
# confirm
cat /etc/hostname
# reboot
reboot
```

## SSH back into machine

```sh
# wait for reboot
sleep 30
ssh -i ./udemy-devops-project/follow/secrets/aws-jenkins.pem ec2-user@$jenkins
sudo su -
```

## Update OS

```sh
yum update -y && yum upgrade -y
```

## Install Jenkins and Java 11

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

## Multi-line echo with indentation (YAML)

```bash
echo "services:
  caddy:
    image: caddy:alpine
    restart: unless-stopped
    container_name: caddy
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./certs:/certs
      - ./config:/config
      - ./data:/data
      - ./sites:/srv
    network_mode: \"host\"" > docker-compose.yml
cat docker-compose.yml
rm docker-compose.yml
```
