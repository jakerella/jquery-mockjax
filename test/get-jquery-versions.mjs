
import { readFileSync } from 'fs'

export function getjQueryVersions() {
    const metadata = getPackageJSON('./package.json')
    const allVersions = []
    const packages = Object.keys(metadata.peerDependencies)
    for (let name of packages) {
        const jqueryMetadata = getPackageJSON(`./node_modules/${name}/package.json`)
        allVersions.push(jqueryMetadata.version)
    }
    return allVersions
}

function getPackageJSON(filepath) {
    return JSON.parse(readFileSync(filepath).toString())
}
