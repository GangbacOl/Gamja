module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'user',
        {
            nickname: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true,
            },
            username: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(40),
                allowNull: false,
                unique: true,
            },
            pwd: {
                type: DataTypes.STRING(30),
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true,
            },
            bank_account: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            follower: {
                type: DataTypes.JSON,
            },
            follow: {
                type: DataTypes.JSON,
            },
            region: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            address: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
        },
        { tableName: 'user' }
    );
};
