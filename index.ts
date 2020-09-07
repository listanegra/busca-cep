import cheerio from 'cheerio'
import qs from 'querystring'

import Axios from 'axios'
const axios = Axios.create({
    baseURL: 'http://www.buscacep.correios.com.br/sistemas/buscacep'
});

export declare interface Endereco {

    readonly cep: string;
    readonly logradouro: string;
    readonly bairro: string;
    readonly uf: string;
    readonly cidade: string;

}

export default class CEPService {

    /**
     * Consulta um endereço no site dos Correios
     * @param query Descrição do endereço ou número do CEP
     */
    public static async buscarEndereco(query: string): Promise<Endereco> {
        const payload = { relaxation: query };
        const response = await axios.post('/resultadoBuscaCepEndereco.cfm',
            qs.stringify(payload), { responseType: 'arraybuffer' }
        );

        const html = (response.data as Buffer)
            .toString('latin1');
        const $ = cheerio.load(html);

        if ($('table.tmptabela').length) {
            const valores = $('table.tmptabela tr td')
                .map((i, e) => $(e).text().trim()).get() as string[];
            const localidade = valores[2].split(/\//g, 2);

            return {
                cep: valores[3],
                logradouro: valores[0],
                bairro: valores[1],
                cidade: localidade[0],
                uf: localidade[1]
            };
        }

        throw new Error('Endereço não encontrado');
    }

}