import DataContainer from '../../../DataContainer';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AdminTable from '../../AdminTable';
import CurrencyEditorField from './CurrencyEditorField';
import { useContext, useState } from 'react';
import { Currency } from '@prisma/client';
import api from '../../../../utils/api';
import { ErrorLogger } from '../../../../contexts';
import CreateCurrencyModal from '../../../Modals/CreateCurrencyModal';

type CurrencyEditorContainerProps = {
    currencies: Currency[];
    disabled?: boolean;
}

export default function CurrencyEditorContainer(props: CurrencyEditorContainerProps) {
    const logError = useContext(ErrorLogger);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [currency, setCurrency] = useState(props.currencies);

    function createCurrency(name: string) {
        api.put('/sheet/currency', { name }).then(res => {
            const id = res.data.id;
            setCurrency([...currency, { id, name }]);
        }).catch(logError);
    }

    function deleteCurrency(id: number) {
        if (!confirm('Tem certeza de que deseja apagar esse item?')) return;
        api.delete('/sheet/currency', { data: { id } }).then(() => {
            const newCurrency = [...currency];
            const index = newCurrency.findIndex(currency => currency.id === id);
            if (index > -1) {
                newCurrency.splice(index, 1);
                setCurrency(newCurrency);
            }
        }).catch(logError);
    }

    return (
        <>
            <DataContainer outline title='Moedas'
                addButton={{ onAdd: () => setShowCurrencyModal(true), disabled: props.disabled }}>
                <Row>
                    <Col>
                        <AdminTable>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th title='Nome da Moeda.'>Nome</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currency.map(currency =>
                                    <CurrencyEditorField key={currency.id} deleteDisabled={props.disabled}
                                        currency={currency} onDelete={deleteCurrency} />
                                )}
                            </tbody>
                        </AdminTable>
                    </Col>
                </Row>
            </DataContainer>
            <CreateCurrencyModal show={showCurrencyModal} onHide={() => setShowCurrencyModal(false)}
                onCreate={createCurrency} />
        </>
    );
}