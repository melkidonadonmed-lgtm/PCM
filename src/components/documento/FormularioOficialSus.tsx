import React from 'react';
import type { SusFilledFormData } from '../../types';
import type { CampoDoFormulario, FormularioOficial } from '../../data/formulariosOficiaisSus';
import { ajustarTexto, ENTRELINHA_DO_FORMULARIO } from '../../utils/formularioOficial';
import { alturaFolhaPx, larguraFolhaPx } from '../../utils/folhaA4';

interface FormularioOficialSusProps {
  formulario: FormularioOficial;
  dados: SusFilledFormData;
  /** Data impressa no campo "data da solicitação". */
  emissao?: Date;
}

const COR_DO_PREENCHIMENTO = '#0B1220';
/** Folga para a folha impressa não transbordar para uma segunda página em branco. */
const FOLGA_VERTICAL_PX = 6;
/** Caixa mais alta que isto é campo de texto longo: o texto começa no topo. */
const ALTURA_DE_TEXTO_LONGO_PT = 30;

/**
 * Formulário oficial do SUS preenchido: a imagem do impresso do órgão ocupa a
 * folha inteira e os dados são escritos por cima, cada um no seu campo. Deve
 * ficar dentro de uma `FolhaA4` com a classe `folha-a4--formulario` (sem margem).
 *
 * A imagem é um <img> (e não fundo em CSS) porque o navegador omite fundos na
 * impressão. Campo sem dado não desenha nada: fica em branco para a caneta.
 */
export const FormularioOficialSus: React.FC<FormularioOficialSusProps> = ({ formulario, dados, emissao = new Date() }) => {
  const [larguraPt, alturaPt] = formulario.pagina;
  const escala = Math.min(
    larguraFolhaPx('portrait') / larguraPt,
    (alturaFolhaPx('portrait') - FOLGA_VERTICAL_PX) / alturaPt
  );
  const px = (pt: number) => `${Math.round(pt * escala * 100) / 100}px`;

  const desenhar = (campo: CampoDoFormulario, indice: number) => {
    if (campo.tipo === 'marca') {
      const [x0, y0, x1, y1] = campo.caixa;
      return (
        <span
          key={indice}
          data-campo={campo.campo}
          style={{
            position: 'absolute', left: px(x0), top: px(y0), width: px(x1 - x0), height: px(y1 - y0),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: px((y1 - y0) * 1.05), fontWeight: 700, lineHeight: 1
          }}
        >
          X
        </span>
      );
    }

    if (campo.tipo === 'pente') {
      const caracteres = Array.from(campo.valor);
      const quadriculas = campo.celulas.length - 1;
      if (caracteres.length > quadriculas) {
        // Mais caracteres que quadrículas: escreve corrido, para não perder dígito.
        return desenhar(
          {
            tipo: 'texto',
            campo: campo.campo,
            caixa: [campo.celulas[0] + 1.5, campo.y0, campo.celulas[quadriculas] - 1.5, campo.y1 - 0.8],
            valor: campo.valor
          },
          indice
        );
      }
      const altura = campo.y1 - campo.y0;
      return (
        <React.Fragment key={indice}>
          {caracteres.map((caractere, i) => {
            const largura = campo.celulas[i + 1] - campo.celulas[i];
            return (
              <span
                key={i}
                data-campo={campo.campo}
                style={{
                  position: 'absolute', left: px(campo.celulas[i]), top: px(campo.y0), width: px(largura), height: px(altura),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: px(Math.min(9.5, altura * 0.82, largura * 0.8)), lineHeight: 1
                }}
              >
                {caractere}
              </span>
            );
          })}
        </React.Fragment>
      );
    }

    const [x0, y0, x1, y1] = campo.caixa;
    const altura = y1 - y0;
    const ajuste = ajustarTexto(campo.valor, x1 - x0, altura, { max: campo.tamanhoMaximo });
    const alinhamentoVertical = campo.noPe ? 'flex-end' : altura > ALTURA_DE_TEXTO_LONGO_PT ? 'flex-start' : 'center';
    return (
      <div
        key={indice}
        data-campo={campo.campo}
        data-cabe={ajuste.cabe ? undefined : 'nao'}
        style={{
          position: 'absolute', left: px(x0), top: px(y0), width: px(x1 - x0), height: px(altura),
          display: 'flex', flexDirection: 'column', justifyContent: alinhamentoVertical,
          fontSize: px(ajuste.tamanho), lineHeight: ENTRELINHA_DO_FORMULARIO,
          textAlign: campo.centralizado ? 'center' : 'left'
        }}
      >
        {ajuste.linhas.map((linha, i) => (
          <div key={i} style={{ whiteSpace: 'nowrap' }}>{linha}</div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="formulario-oficial-sus"
      style={{
        position: 'relative',
        width: px(larguraPt),
        height: px(alturaPt),
        margin: '0 auto',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: COR_DO_PREENCHIMENTO
      }}
    >
      <img
        src={formulario.imagem}
        alt={`Formulário oficial: ${formulario.titulo}`}
        draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
      {formulario.montar(dados, emissao).map(desenhar)}
    </div>
  );
};
