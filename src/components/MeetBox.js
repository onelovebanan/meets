import React, {Component} from 'react';
import { Button, IS_PLATFORM_IOS, Link, ActionSheetItem, ActionSheet, Div } from '@vkontakte/vkui/';

import connect from '@vkontakte/vk-connect';

import Icon28MoreHorizontal from '@vkontakte/icons/dist/28/more_horizontal';
import Icon28Messages from '@vkontakte/icons/dist/28/messages';
import { shortNumber } from '../js/helpers';

class MeetBox extends Component {


    goMeet = () => {
        const { meet, setParentState } = this.props;
        connect.send('VKWebAppEnableSwipeBack');

        setParentState({
            meet: meet,
            activePanel: 'meet'
        });
    }
    openActionSheet = (e) => {
      e.stopPropagation();
      const { meet, api, setParentState, fetchedUser } = this.props;

      const removeMeetMember = e => {

      const { state, getUserMeets, isFave, getOwneredMeets, getExpiredUserMeets, getMeets } = this.props

      const userId = fetchedUser.id;
      api.RemoveMeetMember({
          id: fetchedUser.id,
          meet: meet.id
        }).then(res => {
          if(isFave) {
            let activeTab = state.activeTab
            if(activeTab === 'all'){
              getUserMeets(userId);
            } else if(activeTab === 'my'){
              getOwneredMeets(userId);
            } else if(activeTab === 'exp'){
              getExpiredUserMeets(userId);
            }
          } else {
            getMeets(userId)
          }
        });
      }

      setParentState({
          popout:
          <ActionSheet onClose={() => setParentState({ popout: null })}>
            <ActionSheetItem onClick={ this.goMeet } autoclose>
              Перейти на страницу петиции
            </ActionSheetItem>
            {meet.ismember &&
            <ActionSheetItem onClick={ () => this.props.makeStory(meet.id) } autoclose>
              Поделиться в истории
            </ActionSheetItem> }
            {meet.ismember &&
            <ActionSheetItem onClick={() => removeMeetMember()} autoclose theme="destructive">
              Отказаться от участия
            </ActionSheetItem>}
            {IS_PLATFORM_IOS && <ActionSheetItem autoclose theme="cancel">Отменить</ActionSheetItem>}
          </ActionSheet>,
      });
  }
  componentDidMount(){}

    render() {
        const { meet } = this.props;
        const backgroundImage = `url(${meet.photo})`;

        var meetMembers = shortNumber(meet.members_amount)

        return (
            <Div className="MeetBox" onClick={ this.goMeet } style={{ backgroundImage }} >
                <Div className="MeetMore">
                    <Icon28MoreHorizontal  onClick={(e) => this.openActionSheet(e) }/>
                </Div>
                <Div className="MeetName">{ meet.name }</Div>
                <Div className="MeetAction">
                    {
                      !meet.ismember ?
                      <Button id='no_part' disabled={ meet.approved === 0 || meet.isexpired } level="secondary"> <span className="bold">Участвовать</span> </Button>
                      : <Button id='part' disabled={ meet.approved === 0 || meet.isexpired } level="commerce"><span className="bold_White">Участвую!</span> </Button>
                    }
                    <Div className="MeetMembers">{ meetMembers }</Div>
                    {
                      meet.ismember === 11 &&
                        <Link id='link' onClick={e => e.stopPropagation()} target="_blank" href="https://vk.me/join/AJQ1d2apLRT8GMtyuXFrAkqD"><Icon28Messages/></Link>
                    }
                </Div>
            </Div>
        )
    }
}

export default MeetBox;
