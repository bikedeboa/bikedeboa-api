'use strict';
var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fullname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [5, 50],
                    msg: 'Seu nome completo deve ter no mínimo 5 e no máximo 50 caracteres.'
                }
            }
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: 'Usuário já existe.'
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [6, 100],
                    msg: 'Sua senha deve ter no mínimo 6 e no máximo 8 caracteres.'
                }
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
                if (!user.password) return; 
                user.password = bcrypt.hashSync(user.password, 10);
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