1. Khi chạy lệnh walrus init 
- Setup các bước cần thiết (có check hỏi user lại đã có chưa trước khi cài) 
ref doc: https://rust-lang.org/tools/install/ (install rust if not have)
ref doc: https://docs.wal.app/docs/usage/started
    + Tải suiup:     $ curl -sSfL https://raw.githubusercontent.com/Mystenlabs/suiup/main/install.sh | sh
    + tải sui và walrus     $ suiup install sui
    $ suiup install walrus

Download the configuration file:

    $ curl --create-dirs https://docs.wal.app/setup/client_config.yaml -o ~/.config/walrus/client_config.yaml

Configure the Sui client to connect to Testnet.

    $ sui client

When prompted, enter the following:

Connect to a Sui Full Node server? → Y
Full node server URL → https://fullnode.testnet.sui.io:443
Environment alias → testnet
Select key scheme → 0 (for ed25519)
This creates your Sui client configuration file with a Testnet environment and generates your first address.

To confirm the Walrus configuration also uses Testnet, run the command:

    $ walrus info

Make sure that this command's output includes Epoch duration: 1day to indicate connection to Testnet.

For detailed information about the walrus command-line tool, use the walrus --help command. Or, append --help to any walrus subcommand to get details about that specific command.


- Tải binary site-builder về máy 
+ Có 2 options testnet và mainnet (tập trung vào testnet ở bản mvp trước)
+ Tải binary từ link
Testnet binaries
OS	CPU	Architecture
Ubuntu	Intel 64bit	site-builder-testnet-latest-ubuntu-x86_64 https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-ubuntu-x86_64
MacOS	Apple Silicon	site-builder-testnet-latest-macos-arm64 https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-macos-arm64
MacOS	Intel 64bit	site-builder-testnet-latest-macos-x86_64 https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-macos-x86_64
Windows	Intel 64bit	site-builder-testnet-latest-windows-x86_64.exe https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-windows-x86_64.exe

+ tải từ github release https://github.com/MystenLabs/walrus-sites/releases/tag/mainnet-v2.2.1 file tgz 

Testnet curl request
SYSTEM= # set this to your system: ubuntu-x86_64, ubuntu-x86_64-generic, macos-x86_64, macos-arm64, windows-x86_64.exe
curl https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-$SYSTEM -o site-builder
chmod +x site-builder

https://docs.wal.app/docs/walrus-sites/tutorial-install

generate sites_config.yaml -> define location of yaml


command: walrus build -> choose directory -> choose address 

setting suiNS name 


