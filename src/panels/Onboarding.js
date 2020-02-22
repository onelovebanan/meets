import React, {Component} from 'react';
import { Panel, PanelHeader, Button, FixedLayout, Div } from '@vkontakte/vkui';

import '@vkontakte/vkui/dist/vkui.css';
import './Onboarding.css';
//import img from '../img/list.png'
class Rules extends Component {


    render() {
        const { id, onStoryChange } = this.props;
      //  const idc = state.scheme === 'space_gray' || 'client_dark' ? 'titleD' : 'titleL'
    //    const idc2 = state.scheme === 'space_gray' || 'client_dark' ? 'subtitleD' : 'subtitleL'
        return (
            <Panel id={id}>
                <PanelHeader>Диванные петиции</PanelHeader>
              {/*  <img alt='' style={{ textAlign: 'center' }} width="75%" height="100%" src={img}/>*/}
              <Div className='title' style={{ textAlign: 'center', marginTop: '40%' }}>Диванные петиции</Div>
                <Div style={{ textAlign: 'justify' }} className='subtitle' > Диванные петиции — новый способ выразить свое мнение не выходя из дома.
Приложение и контент в нем не преследует цели кого-либо оскорбить, является исключительно юмористическим, носит развлекательный контент и тщательно модерируется.</Div>
                <FixedLayout vertical='bottom'>
                <Div>
                <Button size='l' stretched onClick={() => onStoryChange('onboarding', 'onboarding2')} level="primary">Далее</Button>
                </Div>
                </FixedLayout>
            </Panel>
        );
    }
}

export default Rules;
