import { Currency } from '@prisma/client';
import { useContext } from 'react';
import Button from 'react-bootstrap/Button';
import { ErrorLogger } from '../../../../contexts';
import useExtendedState from '../../../../hooks/useExtendedState';
import api from '../../../../utils/api';
import BottomTextInput from '../../../BottomTextInput';
import { BsTrash } from 'react-icons/bs';

type CurrencyEditorFieldProps = {
    currency: Currency;
    deleteDisabled?: boolean;
    onDelete(id: number): void;
}

export default function CurrencyEditorField(props: CurrencyEditorFieldProps) {
    const [lastName, name, setName] = useExtendedState(props.currency.name);
    const logError = useContext(ErrorLogger);

    function onBlur() {
        if (name === lastName) return;
        setName(name);
        api.post('/sheet/currency', { id: props.currency.id, name }).catch(logError);
    }

    return (
        <tr>
            <td>
                <Button onClick={() => props.onDelete(props.currency.id)} size='sm'
                    variant='secondary' disabled={props.deleteDisabled}>
                    <BsTrash color='white' size={24} />
                </Button>
            </td>
            <td>
                <BottomTextInput value={name} onChange={ev => setName(ev.currentTarget.value)}
                    onBlur={onBlur} />
            </td>
        </tr>
    );
}