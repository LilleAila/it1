with import <nixpkgs> {}; mkShell {
  packages = [
    cloudflared
    cloc

    nodejs_22
    bun

    black
    pyright

    typescript-language-server

    (python3.withPackages (ps: with ps; [
      openpyxl
      pillow

      ipdb
    ]))

    plantuml
  ];
}
