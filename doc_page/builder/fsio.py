"""Escrita de arquivo determinística.

A saída do build é versionada, então ela precisa ser byte-a-byte igual
independente do sistema operacional. `Path.write_text` traduz `\\n` para
`os.linesep` ao escrever, o que no Windows produz CRLF e no Linux LF — e aí o
mesmo conteúdo gera diff dependendo de quem rodou o build.

Pior: parte da saída já saía por `write_bytes` (CSS e JS), que não traduz.
A saída ficava com dois tipos de quebra de linha no mesmo commit.

Aqui tudo sai UTF-8 com LF, sempre.
"""

from __future__ import annotations

from pathlib import Path


def write(path: Path, text: str) -> None:
    """Escreve UTF-8 com LF, criando a pasta se precisar."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode("utf-8"))
