'use strict';
var bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fullname: {
            type: DataTypes.STRING,
            // allowNull: false,
            validate: {
                len: {
                    args: [5, 50],
                    msg: 'Seu nome completo deve ter no mínimo 5 e no máximo 50 caracteres.'
                }
            }
        },
        username: {
            type: DataTypes.STRING,
            unique: {
                msg: 'Usuário já existe.'
            }
        },
        password: {
            type: DataTypes.STRING, 
            validate: {
                len: {
                    args: [6, 100],
                    msg: 'Sua senha deve ter no mínimo 6 e no máximo 8 caracteres.'
                }
            }
        },
        role: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING,
            // allowNull: false
        }, 
        facebook_id: {
            type: DataTypes.STRING,
            unique: {
                msg: 'Perfil de Facebook já cadastrado.'
            }
        }
    },
    {
        timestamps: true,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
            // associations can be defined here
            }
        },
        hooks: {
            beforeValidate: function (user, options) {
                if (typeof user.username === 'string') {
                    user.username = user.username.toLowerCase();
                }
            },
            beforeCreate: function(user, options) {
                if (user.password) {
                    user.password = bcrypt.hashSync(user.password);
                }
            }
        },
        instanceMethods : {
            validPassword: function(password, hash){
                return bcrypt.compareSync(password, hash);
            }
        }
    });
    return User;
};
