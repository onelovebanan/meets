import React, {Component} from 'react';
import { Panel, PanelHeader, Button, FixedLayout, Div } from '@vkontakte/vkui';

import connect from '@vkontakte/vk-connect';
import '@vkontakte/vkui/dist/vkui.css';
import './Onboarding.css';
import Checkbox from "@vkontakte/vkui/dist/components/Checkbox/Checkbox";
class Rules extends Component {


    render() {
        const { id, onStoryChange } = this.props;

        return (
            <Panel id={id}>
                <PanelHeader>Диванные петиции</PanelHeader>
                <Div className='title' style={{ textAlign: 'center', marginTop: '40%' }}>Уведомления</Div>
                <Div style={{ textAlign: 'justify' }} className='subtitle'>
                Если вы хотите получать важные уведомления, то разрешите их в следующем окне. </Div>
                <Div style={{ textAlign: 'center' }} className='subtitle'>
                Обещаем не тревожить по пустякам!</Div>
                <FixedLayout vertical='bottom'>
                    <Checkbox id='noty'>Не присылать уведомления</Checkbox>
                    <Div style={{ display: 'flex' }}>
                        <Button
                            size='x'
                            onClick={() => onStoryChange('onboarding', 'onboarding2')}
                            level="secondary"
                            stretched
                        >Назад</Button>
                        <Button
                            style={{ marginLeft: 10 }}
                            size='l'
                            onClick={() => {
                                onStoryChange('home', 'meets')
                                if(document.getElementById('noty').checked){
                                    console.log('((')
                                    return;
                                }
                                connect.send("VKWebAppAllowMessagesFromGroup", { "group_id": 189366357 });
                            }}
                            level="primary"
                            stretched
                        >Начать</Button>
                    </Div>
                </FixedLayout>
            </Panel>
        );
    }
}

export default Rules;
