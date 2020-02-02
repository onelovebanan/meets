import React, {Component} from 'react';
import { Panel, PanelHeader, Button, FixedLayout, Div } from '@vkontakte/vkui';

import '@vkontakte/vkui/dist/vkui.css';
import './Onboarding.css';
//import img from '../img/list.png'
class Rules extends Component {


    render() {
        const { id, onStoryChange } = this.props;

        return (
            <Panel id={id}>
                <PanelHeader>Диванные петиции</PanelHeader>
                {/*  <img alt='' style={{ textAlign: 'center' }} width="75%" height="100%" src={img}/>*/}
                <Div className='title' style={{ textAlign: 'center', marginTop: '40%' }}>Навигация</Div>
                <Div style={{ textAlign: 'justify' }} className='subtitle'>
                На первой вкладке находится список петиций, на второй — раздел для организации собственной, и на третьей — те, в которых вы принимаете участие. </Div>
                <FixedLayout vertical='bottom'>
                <Div>
                <Button size='xl' onClick={() => onStoryChange('onboarding', 'onboarding3')} level="primary">Далее</Button>
                </Div>
                </FixedLayout>
            </Panel>
        );
    }
}

export default Rules;
