import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import Markdown from 'react-remarkable';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import {FormattedMessage} from 'react-intl';
import { Col, Button } from "react-bootstrap";

import RelativeDate from '../nodes/relativeDate';
import CommentAction from '../comments/asUserAction';
import LoadingButton from '../forms/RelayVariableLoadingButton';

const pageSize = 10;

function renderAction(action, viewer) {
  var icon_class;
  if(action.type == "create") {
    icon_class = "fa-plus";
  }
  if(action.type == "change") {
    icon_class = "fa-pencil";
  }
  if(action.type == "delete") {
    icon_class = "fa-trash";
  }

  var objRendered;
  if(action.object.__typename == 'Comment') {
    objRendered = (<CommentAction comment={action.object} viewer={viewer} />);
  }

  return (<div key={action.id}>
    <i className={`fa ${icon_class}`} aria-hidden="true"></i> {action.type} -> <Link to={`/revisions/revision/${action.id}`}>
    {action.object.__typename}:{action.object.id}</Link> | <i className="fa fa-clock-o" aria-hidden="true"></i> <RelativeDate date={action.createdAt} />
    {objRendered}
  </div>);
}

class Profile extends React.Component {
  state = {}

  loadMoreActions = () => {
    return {
      relay: this.props.relay,
      variables: {pageSize: this.props.relay.variables.pageSize + pageSize},
    };
  }

  render() {
    var user = this.props.user;
    var viewer = this.props.viewer;
    
    return (
      <div className="profile-component">
        <Helmet
          title={user.username}
        />

        <Col sm={2}>
          <img src={user.avatar.url} width="160" className="img-thumbnail" />
        </Col>
        <Col sm={10}>
          <div className="page-header" style={{marginTop: 0}}>
              <h1 style={{marginTop: 0}}>{user.username} <small>({user.reputation})</small></h1>
          </div>

          <h2>Últimas atividades</h2>
          {user.actions.edges.map(function(edge, i){
            return renderAction(edge.node, viewer);
          })}

          <LoadingButton
            type="button"
            getSetVariables={this.loadMoreActions}
            loadingText="carregando ..."
          >
            carregar mais
          </LoadingButton>
        </Col>
      </div>
    );
  }
}

export default Relay.createContainer(Profile, {
  initialVariables: {
    pageSize: pageSize
  },
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        id,
        username
        firstName
        reputation
        avatar(width: 160, height: 160) {
          url
        }
        actions(first: $pageSize) {
          edges {
            node {
              id
              type
              createdAt
              object {
                id
                __typename
                
                ... on Vote {
                  value
                }
                
                ... on Comment {
                  body
                  ${CommentAction.getFragment('comment')},
                }
              }
            }
          }
        }
      }
    `,
    viewer: () => Relay.QL`
      fragment on Query {
        id,
        ${CommentAction.getFragment('viewer')},
      }
    `,
  },
});
