import DataContainer from '../../../DataContainer';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import AttributeEditorField from './AttributeEditorField';
import { useContext, useState } from 'react';
import { Attribute, AttributeStatus } from '@prisma/client';
import api from '../../../../utils/api';
import { ErrorLogger } from '../../../../contexts';
import CreateAttributeModal from '../../../Modals/CreateAttributeModal';
import AttributeStatusEditorField from './AttributeStatusEditorField';
import CreateAttributeStatusModal from '../../../Modals/CreateAttributeStatusModal';

type AttributeEditorContainerProps = {
    attributes: Attribute[];
    attributeStatus: AttributeStatus[];
    disabled?: boolean;
}

export default function AttributeEditorContainer(props: AttributeEditorContainerProps) {
    const logError = useContext(ErrorLogger);
    const [showAttributeModal, setShowAttributeModal] = useState(false);
    const [attributes, setAttributes] = useState(props.attributes);
    const [showAttributeStatusModal, setShowAttributeStatusModal] = useState(false);
    const [attributeStatus, setAttributeStatus] = useState(props.attributeStatus);

    function onAttributeNameChange(id: number, name: string) {
        const newAttributes = [...attributes];
        const attr = newAttributes.find(attr => attr.id === id);
        if (attr) {
            attr.name = name;
            setAttributes(newAttributes);
        }
    }

    function createAttribute(name: string, rollable: boolean) {
        api.put('/sheet/attribute', { name, rollable }).then(res => {
            const id = res.data.id;
            setAttributes([...attributes, { id, name, rollable, color: res.data.color }]);
        }).catch(logError);
    }

    function deleteAttribute(id: number) {
        if (!confirm('Tem certeza de que deseja apagar esse item?')) return;
        api.delete('/sheet/attribute', { data: { id } }).then(() => {
            const newAttribute = [...attributes];
            const index = newAttribute.findIndex(attr => attr.id === id);
            if (index > -1) {
                newAttribute.splice(index, 1);
                setAttributes(newAttribute);
            }
        }).catch(logError);
    }

    function createAttributeStatus(name: string, attributeID: number) {
        api.put('/sheet/attribute/status', { name, attributeID }).then(res => {
            const id = res.data.id;
            setAttributeStatus([...attributeStatus, { id, name, attribute_id: attributeID }]);
        }).catch(logError);
    }

    function deleteAttributeStatus(id: number) {
        if (!confirm('Tem certeza de que deseja apagar esse item?')) return;
        api.delete('/sheet/attribute/status', { data: { id } }).then(() => {
            const newAttributeStatus = [...attributeStatus];
            const index = newAttributeStatus.findIndex(status => status.id === id);
            if (index > -1) {
                newAttributeStatus.splice(index, 1);
                setAttributeStatus(newAttributeStatus);
            }
        }).catch(logError);
    }

    return (
        <>
            <Row>
                <DataContainer outline title='Atributos'
                    addButton={{ onAdd: () => setShowAttributeModal(true), disabled: props.disabled }}>
                    <Row>
                        <Col>
                            <Table responsive className='align-middle'>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th title='Nome do Atributo.'>Nome</th>
                                        <th title='Cor do Atributo.'>Cor</th>
                                        <th title='Define se o Atributo pode ser usado para testes de dado.'>Testável</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attributes.map(attribute =>
                                        <AttributeEditorField key={attribute.id} deleteDisabled={props.disabled}
                                            attribute={attribute} onDelete={deleteAttribute}
                                            onNameChange={onAttributeNameChange} />
                                    )}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </DataContainer>
            </Row>
            <Row>
                <DataContainer outline title='Status de Atributos'
                    addButton={{ onAdd: () => setShowAttributeStatusModal(true), disabled: props.disabled }}>
                    <Row>
                        <Col>
                            <Table responsive className='align-middle'>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th title='Nome do Status de Atributo.'>Nome</th>
                                        <th title='Define a qual Atributo esse Status será ligado.'>Atributo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attributeStatus.map(stat =>
                                        <AttributeStatusEditorField key={stat.id} attributeStatus={stat}
                                            attributes={attributes} onDelete={deleteAttributeStatus}
                                            deleteDisabled={props.disabled} />
                                    )}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </DataContainer>
            </Row>
            <CreateAttributeModal show={showAttributeModal} onHide={() => setShowAttributeModal(false)}
                onCreate={createAttribute} />
            <CreateAttributeStatusModal show={showAttributeStatusModal} onHide={() => setShowAttributeStatusModal(false)}
                onCreate={createAttributeStatus} attributes={attributes} />
        </>
    );
}