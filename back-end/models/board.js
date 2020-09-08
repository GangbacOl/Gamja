module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'board',
        {
            title: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            region: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            goods: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            unit: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
            total_quantity: {
                type: DataTypes.INTEGER(5),
                allowNull: false,
            },
            price: {
                type: DataTypes.INTEGER(10),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            ipath: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            uniqueKey: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true,
            },
        },
        { tableName: 'board' }
    );
};
