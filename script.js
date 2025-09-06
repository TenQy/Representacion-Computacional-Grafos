document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('generateGraph');
    button.addEventListener('click', function(){
        const rows = document.querySelectorAll('tbody tr');
        const routes = [];
        const vertices = new Set();

        rows.forEach(function(row, index) {
            const inputs = row.querySelectorAll('input');
            const origen = inputs[0].value.trim();
            const destino = inputs[1].value.trim();
            const peso = inputs[2].value.trim();

            if(origin && destino && peso) {
                routes.push({
                    from: origen,
                    to: destino,
                    weight: parseInt(peso)
                });

                vertices.add(origen);
                vertices.add(destino);
            }
        });

        console.log("Rutas validas", routes);
        console.log("Vertices unicos: ", Array.from(vertices));

        const isDirected = document.getElementById('directed').checked;
        console.log("Grafo dirigido: ", isDirected);

        const vertexList = Array.from(vertices).sort();
        console.log("Vertices ordenados: ", vertexList);

        const matrixSize = vertexList.length;
        const matrix = [];

        for (let i = 0; i < matrixSize; i++) {
            matrix[i] = [];
            for (let j = 0; j < matrixSize; j++) {
                matrix[i][j] = 0;
            }
        }

        console.log("Matriz inicial: ", matrix)

        routes.forEach(function(route) {
            const fromIndex = vertexList.indexOf(route.from);
            const toIndex = vertexList.indexOf(route.to);

            matrix[fromIndex][toIndex] = route.weight;

            if (!isDirected) {
                matrix[toIndex][fromIndex] = route.weight;
            }
        });

        console.log("Matriz final: ", matrix);

        function displayMatrix(matrix, vertices) {
            let htmlTable = '<h3>Matriz de Adyecencia</h3>';
            htmlTable += '<table border="1">';

            htmlTable += '<tr><th></th>';
            vertices.forEach(function(vertex) {
                htmlTable += `<th>${vertex}</th>`;
            });
            htmlTable += '</tr>';

            vertices.forEach(function(rowVertex, i) {
                htmlTable += `<tr><th>${rowVertex}</th>`;
                matrix[i].forEach(function(value) {
                    htmlTable += `<td>${value}</td>`;
                });
                htmlTable += '</tr>';
            });

            htmlTable += '</table>';

            document.getElementById('adjacencyMatrix').innerHTML = htmlTable;
        }

        displayMatrix(matrix, vertexList);
    });
});