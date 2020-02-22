import React, {Component} from 'react';
import { Group, Div, IS_PLATFORM_IOS, ActionSheetItem, ActionSheet, Avatar, Textarea, Link, Button, Spinner } from '@vkontakte/vkui';

import { getMessage } from '../js/helpers';

import Icon16MoreVertical from '@vkontakte/icons/dist/16/more_vertical';
import Icon16Like from '@vkontakte/icons/dist/16/like';
import Icon16LikeOutline from '@vkontakte/icons/dist/16/like_outline';

import '../css/App.css';

class ComList extends Component {
  constructor(props) {
      super(props);

      this.state = {
          meet: this.props.state.meet,
          comment_text: '',
          snackbar: null,
          loading: false
      };

      this.api = this.props.api;
  }

  componentDidMount() {}

    render() {
        const { comments, setParentState, openErrorSnackbar, openDoneSnackbar, fetchedUser, isUserAdmin } = this.props;
        const { meet } = this.state;
        if(comments === false){
          return <Div><Spinner/></Div>
        }

        const addComment = e => {
          this.setState({ loading: true });
          this.api.AddComment({
            comment: e,
            meet: meet.id
          }).then( e => {
           if(e.success){
             this.api.GetMeetComments(this.props.state.meet.id).then(comments => setParentState({ comments }))
             document.getElementById('comm_inp').value = ''
             this.setState({ comment_text: '' })
           } else if(e.failed){
              openErrorSnackbar(e.failed)
           } else {
             openErrorSnackbar('Нельзя отправлять комментарии так часто.')
           }
             this.setState({ loading: false });
          })
        }
        const commAction = e => {
          setParentState({
              popout:
              <ActionSheet onClose={() => setParentState({ popout: null })}>
                <ActionSheetItem onClick={() => removeComment(e)} autoclose theme="destructive">
                  Удалить комментарий
                </ActionSheetItem>
                {IS_PLATFORM_IOS && <ActionSheetItem autoclose theme="cancel">Отменить</ActionSheetItem>}
              </ActionSheet>,
          });
        }

        const rateComment = (id, type) => {
          let act;
          if(type){
            act = 0;
          } else act = 1;
          this.api.RateComment({
            comment: id,
            act: act
            }).then( e => {
           if(e) {
             if(e.length === 0) {
               openErrorSnackbar('Не так часто')
               return
             } else if(e.status || e.success){
               this.api.GetMeetComments(this.props.state.meet.id).then(comments => {
                 setParentState({ comments });
               });
             } else if(e.message){
               openErrorSnackbar(e.message);
             } else if(e.failed){
               openErrorSnackbar(e.failed);
             }
           }

         });
        }

        const removeComment = e => {
          setParentState({ comments: false })
          this.api.RemoveComment({ comment: e }).then( e => {
            if(e.length === 0) {
              openErrorSnackbar('Не так часто')
              return
            }
           if(e.status || e.success){
              this.api.GetMeetComments(this.props.state.meet.id).then(comments => setParentState({ comments }));
               openDoneSnackbar('Комментарий удалён.');
           } else if(e.message){
             openErrorSnackbar(e.message);
           } else if(e.failed){
             openErrorSnackbar(e.failed);
           }
         });
        }
        return (
            <>
                        {this.state.snackbar}
                {
                    (comments && comments.length) ?
                        <>
                            {
                                comments.map((comment, index) =>

                                <Group className='commentItem'  key={index}>
                                <Div style={{ display: 'flex'}}>
                                   <Link href={"https://vk.com/id" + comment.ownerid} target="_blank">
                                  <Avatar style={{ minWidth: 36 }} size={36} src={comment.owner_photo}/>
                                    </Link>
                                 <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 10, wordBreak: 'break-all', width: '100%'}}>
                                   <Link href={"https://vk.com/id" + comment.ownerid} target="_blank">
                                   <Div id='comm'>{`${comment.owner_name}  ${comment.owner_surname}`}</Div>
                                   </Link>
                                  {comment.comment}
                                                                   {comment.rate}
                                   </div>

                                      <Button
                                        id='like'
                                        style={{ float: 'right' }}
                                        level="tertiary"
                                        onClick={ (e) => {
                                          e.stopPropagation()
                                         rateComment(comment.id, comment.isliked)
                                        } }
                                        before={comment.isliked ? <Icon16Like id='like'/> :  <Icon16LikeOutline id='like'/> }>
                                      {comment.rating !== 0 && comment.rating}
                                    </Button>
                                   {((comment.ownerid === fetchedUser.id) || isUserAdmin) &&
                                      <Button
                                         level="tertiary"
                                         style={{ float: 'right' }}
                                         onClick={ (e) => {
                                           e.stopPropagation()
                                          commAction(comment.id)
                                         } }
                                         ><Icon16MoreVertical/>
                                    </Button>}
                                </Div>
                                </Group>
                              )
                            }
                        </>
                        :
                        <Group style={{ borderRadius: '15px' }}>
                            <Div style={{ textAlign: 'center' }}>{ getMessage('comm_empty_list') }</Div>
                        </Group>
                }
                {
                    !this.props.isExpired &&
                    <Group>
                        <Div>
                            <Textarea
                                maxLength='45'
                                style={{ borderRadius: '15px' }}
                                placeholder={'Напишите комментарий'}
                                id='comm_inp'
                                value={this.state.comment_text}
                                onChange={ e =>  this.setState({ comment_text: e.currentTarget.value }) }
                            />
                            <Button
                                disabled={!this.state.comment_text || this.state.loading}
                                size='xl'
                                style={{ marginTop: 15,  borderRadius: '60px' }}
                                onClick={ () => {
                                    if(this.state.comment_text){
                                        addComment(this.state.comment_text);
                                    }
                                }}>Отправить комментарий</Button>
                        </Div>
                    </Group>
                }
            </>
        )
    }
}

export default ComList;
