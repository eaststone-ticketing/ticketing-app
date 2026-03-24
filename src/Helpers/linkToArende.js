export default function linkToArende(setActiveTab, setActiveArende, arende, destination = null){
    setActiveTab('Ärenden')
    setActiveArende(arende)
    if(destination){
        //Add the ability to specify a destination within the arende detail view, like if you want to go to comments directly
        return
    }
}