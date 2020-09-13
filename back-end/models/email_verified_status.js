module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'email_verified_status',
        {
            email: {
                type: DataTypes.STRING(40),
                allowNull: false,
                unique: true,
            },
            verified: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            key_for_verify: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true,
            },
        },
        { tableName: 'email_verified_status' }
    );
};
