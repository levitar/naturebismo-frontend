import Relay from 'react-relay';

export default class CommentCreateMutation extends Relay.Mutation {
  static fragments = {
    parent: () => Relay.QL`
      fragment on Node {
        id
      }
    `,
    viewer: () => Relay.QL`
      fragment on Query {
        id,
        me {
          username
          isAuthenticated
        }
      }
    `,
  };
  getMutation() {
    return Relay.QL`mutation{commentCreate}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on CommentCreatePayload {
        parent {
          ... on Post {
            id,
            comments
          }

          ... on Comment {
            id,
            comments
          }
        }
        comment {
          node {
            id,
            body,
            comments {
              count
            },
            revisionCreated {
                author {
                    username
                }
            }
          }
        }
      }
    `;
  }
  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {parent: this.props.parent.id},
      },
      {
        type: 'RANGE_ADD',
        parentName: 'parent',
        parentID: this.props.parent.id,
        connectionName: 'comments',
        edgeName: 'comment',
        rangeBehaviors: {
          '': 'prepend',
        },
      }
    ];
  }
  getVariables() {
    return {
      body: this.props.body,
      parent: this.props.parent.id,
    };
  }
  // getOptimisticResponse() {
  //   return {
  //     comment: {
  //       node: {
  //         body: this.props.body,
  //         revisionCreated: {
  //           author: {
  //             username: this.props.viewer.me.username,
  //           }
  //         },
  //         comments: {
  //           'count': 0,
  //         }
  //       },
  //     },
  //   };
  // }
}
