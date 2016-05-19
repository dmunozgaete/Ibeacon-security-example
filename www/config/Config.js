angular.module("config", []).constant("GLOBAL_CONFIGURATION", {
    application: {
        version: "1.0.0-beta.1",
        environment: "dev",
        language: "es",
        home: "app/home"
    },

    on_build_new_version: function(newVersion, oldVersion) {

        //When has new Version , set the mark in the localstoage 
        localStorage.setItem("$_new_version", 1);
    },

    localstorageStamps: {
        personal_data: "$_personal_data",
        new_version: "$_new_version",
        beacon_configuration: "$_beacon_configuration"
    },

    equip: [{
        name: "Casco",
        photo: "helmet.png",
        description: "Casco de seguridad"
    }, {
        name: "Chaqueta",
        photo: "jacket.svg",
        description: "Chaqueta con protección de fuego"
    }, {
        name: "Pantalones",
        photo: "pants.svg",
        description: "Pantalones industriales"
    }, {
        name: "Guantes",
        photo: "gloves.png",
        description: "Guantes de Seguridad"
    }, {
        name: "Zapatos",
        photo: "shoes.svg",
        description: "Zapatos con punta de acero"
    }]
});
