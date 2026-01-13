with import <nixpkgs> {}; mkShell {
  packages = [
    live-server

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
  ];
}
