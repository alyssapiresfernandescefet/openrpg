import { Prisma } from '@prisma/client';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Router from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import ApplicationHead from '../../components/ApplicationHead';
import DataContainer from '../../components/DataContainer';
import ErrorToastContainer from '../../components/ErrorToastContainer';
import DiceRollResultModal from '../../components/Modals/DiceRollResultModal';
import PlayerAttributeContainer from '../../components/Player/Attribute/PlayerAttributeContainer';
import PlayerEquipmentContainer from '../../components/Player/Equipment/PlayerEquipmentContainer';
import PlayerItemContainer from '../../components/Player/Item/PlayerItemContainer';
import PlayerCharacteristicField from '../../components/Player/PlayerCharacteristicField';
import PlayerInfoField from '../../components/Player/PlayerInfoField';
import PlayerSpecField from '../../components/Player/PlayerSpecField';
import PlayerSkillContainer from '../../components/Player/Skill/PlayerSkillContainer';
import PlayerSpellContainer from '../../components/Player/Spell/PlayerSpellContainer';
import SheetNavbar from '../../components/SheetNavbar';
import { ErrorLogger, ShowDiceResult, Socket } from '../../contexts';
import useSocket, { SocketIO } from '../../hooks/useSocket';
import useToast from '../../hooks/useToast';
import { ResolvedDice } from '../../utils';
import api from '../../utils/api';
import prisma from '../../utils/database';
import { sessionSSR } from '../../utils/session';

const bonusDamageName = 'Dano Bônus';

export default function Sheet1(props: InferGetServerSidePropsType<typeof getServerSidePropsPage1>): JSX.Element {
    const [toasts, addToast] = useToast();

    const [socket, setSocket] = useState<SocketIO | null>(null);

    const [diceRoll, setDiceRoll] = useState<{ dices: string | ResolvedDice[], resolverKey?: string }>({ dices: '' });

    const bonusDamage = useRef(props.playerSpecs.find(spec => spec.Spec.name === bonusDamageName)?.value);

    function onSpecChanged(name: string, value: string) {
        if (name !== bonusDamageName) return;
        bonusDamage.current = value;
    }

    useSocket(socket => {
        socket.emit('roomJoin', `player${props.player.id}`);
        setSocket(socket);
    });

    useEffect(() => {
        if (!socket) return;
        socket.on('playerDelete', () => api.delete('/player').then(() => Router.replace('/')));
        return () => { socket.off('playerDelete'); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    return (
        <>
            <ApplicationHead title='Ficha do Personagem' />
            <SheetNavbar />
            <ErrorLogger.Provider value={addToast}>
                <ShowDiceResult.Provider value={(dices, resolverKey) => { setDiceRoll({ dices, resolverKey }); }}>
                    <Socket.Provider value={socket}>
                        <Container>
                            <Row className='display-5 text-center'>
                                <Col>
                                    Ficha do Personagem
                                </Col>
                            </Row>
                            <Row className='mb-3'>
                                <DataContainer outline title='Detalhes Pessoais'>
                                    <>
                                        {props.playerInfo.map(pinfo =>
                                            <PlayerInfoField key={pinfo.Info.id} info={pinfo.Info} value={pinfo.value} />
                                        )}
                                        <hr />
                                        <Row className='justify-content-center'>
                                            {props.playerSpecs.map(spec =>
                                                <PlayerSpecField key={spec.Spec.id} value={spec.value} Spec={spec.Spec}
                                                    onSpecChanged={onSpecChanged} />
                                            )}
                                        </Row>
                                    </>
                                </DataContainer>
                                <Col>
                                    <PlayerAttributeContainer playerAttributes={props.playerAttributes}
                                        attributeDice={props.diceConfig['attribute'] as Prisma.JsonObject}
                                        playerAttributeStatus={props.playerAttributeStatus} playerAvatars={props.playerAvatars} />
                                </Col>
                            </Row>
                            <Row>
                                <DataContainer outline title='Características'>
                                    <Row className='mb-3 text-center align-items-end justify-content-center'>
                                        {props.playerCharacteristics.map(char =>
                                            <PlayerCharacteristicField key={char.Characteristic.id} modifier={char.modifier}
                                                characteristic={char.Characteristic} value={char.value}
                                                baseDice={props.diceConfig['base'] as Prisma.JsonObject} />
                                        )}
                                    </Row>
                                </DataContainer>
                            </Row>
                            <Row>
                                <PlayerEquipmentContainer availableEquipments={props.availableEquipments}
                                    playerEquipments={props.playerEquipments} />
                            </Row>
                            <Row>
                                <PlayerSkillContainer playerSkills={props.playerSkills} availableSkills={props.availableSkills}
                                    baseDice={props.diceConfig['base'] as Prisma.JsonObject} />
                            </Row>
                            <Row>
                                <PlayerItemContainer playerItems={props.playerItems} availableItems={props.availableItems}
                                    playerMaxLoad={props.player.maxLoad} playerCurrency={props.playerCurrency} />
                            </Row>
                            <Row>
                                <PlayerSpellContainer playerSpells={props.playerSpells.map(sp => sp.Spell)}
                                    availableSpells={props.availableSpells} playerMaxSlots={props.player.maxSlots} />
                            </Row>
                        </Container>
                    </Socket.Provider>
                </ShowDiceResult.Provider>
                <DiceRollResultModal dices={diceRoll.dices} resolverKey={diceRoll.resolverKey}
                    onHide={() => setDiceRoll({ dices: '', resolverKey: undefined })} bonusDamage={bonusDamage.current} />
            </ErrorLogger.Provider>
            <ErrorToastContainer toasts={toasts} />
        </>
    );
}

async function getServerSidePropsPage1(ctx: GetServerSidePropsContext) {
    const player = ctx.req.session.player;

    if (!player) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            },
            props: {
                player: { id: 0, maxLoad: 0, maxSlots: 0 },
                playerInfo: [],
                playerAttributes: [],
                playerAttributeStatus: [],
                playerAvatars: [],
                playerSpecs: [],
                playerCharacteristics: [],
                playerEquipments: [],
                playerSkills: [],
                playerCurrency: [],
                playerItems: [],
                playerSpells: [],
                availableEquipments: [],
                availableSkills: [],
                availableItems: [],
                availableSpells: [],
                diceConfig: {} as Prisma.JsonObject
            }
        };
    }

    const playerID = player.id;

    const results = await prisma.$transaction([
        prisma.playerInfo.findMany({
            where: { player_id: playerID },
            select: { Info: true, value: true }
        }),

        prisma.playerAttribute.findMany({
            where: { player_id: playerID },
            select: { Attribute: true, value: true, maxValue: true }
        }),

        prisma.playerAttributeStatus.findMany({
            where: { player_id: playerID },
            select: { AttributeStatus: true, value: true }
        }),

        prisma.playerSpec.findMany({
            where: { player_id: playerID },
            select: { Spec: true, value: true }
        }),

        prisma.playerCharacteristic.findMany({
            where: { player_id: playerID },
            select: { Characteristic: true, value: true, modifier: true }
        }),

        prisma.playerEquipment.findMany({
            where: { player_id: playerID },
            select: {
                Equipment: {
                    select: {
                        id: true, ammo: true, attacks: true, damage: true,
                        name: true, range: true, type: true
                    }
                },
                currentAmmo: true
            }
        }),

        prisma.playerSkill.findMany({
            where: { player_id: playerID },
            select: {
                Skill: { select: { id: true, name: true, Specialization: { select: { name: true } } } },
                value: true
            }
        }),

        prisma.playerItem.findMany({
            where: { player_id: playerID },
            select: {
                Item: { select: { name: true, id: true, weight: true } },
                currentDescription: true, quantity: true
            }
        }),

        prisma.playerSpell.findMany({
            where: { player_id: playerID },
            select: { Spell: true }
        }),

        prisma.equipment.findMany({
            where: { visible: true, PlayerEquipment: { none: { player_id: playerID } } },
        }),

        prisma.skill.findMany({
            where: { PlayerSkill: { none: { player_id: playerID } } },
        }),

        prisma.item.findMany({
            where: { visible: true, PlayerItem: { none: { player_id: playerID } } },
        }),

        prisma.spell.findMany({
            where: { visible: true, PlayerSpell: { none: { player_id: playerID } } },
        }),

        prisma.playerCurrency.findMany({
            where: { player_id: playerID },
            select: { value: true, Currency: true }
        }),

        prisma.playerAvatar.findMany({
            where: { player_id: playerID },
            select: {
                link: true,
                AttributeStatus: { select: { id: true, name: true } }
            }
        }),

        prisma.player.findUnique({
            where: { id: playerID }, select: { maxLoad: true, spellSlots: true }
        }),
        prisma.config.findUnique({ where: { name: 'dice' } })
    ]);

    return {
        props: {
            playerInfo: results[0],
            playerAttributes: results[1],
            playerAttributeStatus: results[2],
            playerSpecs: results[3],
            playerCharacteristics: results[4],
            playerEquipments: results[5],
            playerSkills: results[6],
            playerItems: results[7],
            playerSpells: results[8],
            availableEquipments: results[9],
            availableSkills: results[10],
            availableItems: results[11],
            availableSpells: results[12],
            playerCurrency: results[13],
            playerAvatars: results[14],
            player: {
                id: playerID,
                maxLoad: results[15]?.maxLoad || 0,
                maxSlots: results[15]?.spellSlots || 0
            },
            diceConfig: JSON.parse(results[16]?.value || '{}') as Prisma.JsonObject,
        }
    };
}
export const getServerSideProps = sessionSSR(getServerSidePropsPage1);