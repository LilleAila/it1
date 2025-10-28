with import <nixpkgs> {}; mkShell {
  packages = [
    nodejs_22
    bun

    black
    pyright

    (python3.withPackages (ps: with ps; [
      openpyxl
      pillow

      ipdb
    ]))
  ];
}
