<script lang="ts">
    import { SvelteFlow, MiniMap, Controls, Background, type Node, type Viewport } from '@xyflow/svelte';
    import { Plus } from '@lucide/svelte';
    import '@xyflow/svelte/dist/style.css';
    import { curriculumStore } from "$lib/states/curriculum.svelte";
    import CustomNode from "$lib/components/CustomNode.svelte";
    import CustomEdge from "$lib/components/CustomEdge.svelte";
    import SemesterNode from "$lib/components/SemesterNode.svelte";
    import HorizontalSeparatorNode from "$lib/components/HorizontalSeparatorNode.svelte";
    import VerticalSeparatorNode from "$lib/components/VerticalSeparatorNode.svelte";
    import AddSemesterNode from "$lib/components/AddSemesterNode.svelte";

    const nodeTypes = {
      custom: CustomNode,
      header: SemesterNode,
      horizontalSeparator: HorizontalSeparatorNode,
      verticalSeparator: VerticalSeparatorNode,
      addSemesterNode: AddSemesterNode
    };
    const edgeTypes = { custom: CustomEdge };

    let nodes = $state.raw([]);
    let edges = $state.raw([]);
    let semesterCount = $state(0)

    const verticalSpacing = 300;
    const horizontalSpacing = 500;

    const customViewport: Viewport = { x: 100, y: 125, zoom: 0.5 };

    $effect(() => {
      const showElectiveModules = false; // default: false
      const columnHeaderYPosition = -200;

      // filter if the elective modules should be shown or not
      const filteredCourses = showElectiveModules
        ? $curriculumStore.courses
        : $curriculumStore.courses.filter(course => {
          const semester = parseInt(course.recommended_semester);
          return isNaN(semester) || semester !== 0;
        });

      // group courses by semester
      const coursesBySemester = filteredCourses.reduce((acc, course) => {
        let semester = parseInt(course.recommended_semester);

        if (isNaN(semester)) {
          semester = 0; // default to semester 0 if parsing fails
        }
        if (!acc[semester]) {
          acc[semester] = { courses: [], totalECTS: 0 };
        }

        // Add the course to the array
        acc[semester].courses.push(course);
        acc[semester].totalECTS += parseFloat(course.credits || 0);

        return acc;
      }, {});

      const highestSemesterInCourses = Math.max(
        0,
        ...Object.keys(coursesBySemester).map(Number)
      );

      semesterCount = Math.max(semesterCount, highestSemesterInCourses);

      // create an array of all semester numbers to be rendered
      const allSemesterNumbers = Array.from({ length: semesterCount }, (_, i) => i + 1);
      if (coursesBySemester[0]) {
        allSemesterNumbers.unshift(0);
      }

      const semesterColumnIndexMap = new Map(allSemesterNumbers.map((sem, index) => [sem, index]));
      const totalColumns = allSemesterNumbers.length;

      const headerNodes = allSemesterNumbers.map((semester) => {
        const columnIndex = semesterColumnIndexMap.get(semester);
        const semesterData = coursesBySemester[semester];

        if (parseInt(semester) == 0) {
          return {
            id: `header-${semester}`,
            type: 'header',
            position: {
              x: columnIndex * horizontalSpacing,
              y: columnHeaderYPosition
            },
            data: { label: 'Modules'},
            draggable: false,
            selectable: false,
            connectable: false,
            style: 'font-size: 1.5rem; font-weight: bold; text-align: center; width: 300px; background: transparent; border: none'
          }
        }

        return {
          id: `header-${semester}`,
          type: 'header',
          position: { x: columnIndex * horizontalSpacing, y: columnHeaderYPosition },
          data: {
            label: `Semester ${semester}`,
            semesterECTS: semesterData ? semesterData.totalECTS : 0
          },
          draggable: false,
          selectable: false,
          connectable: false,
          style: 'font-size: 1.5rem; font-weight: bold; text-align: center; width: 300px; background: transparent; border: none'
        };
      });

      const courseIdToNodeMap = new Map<string, { nodeId: string; semester: number }[]>();

      // create nodes from the grouped structure and adapt the map in the same loop
      const newNodes = Object.keys(coursesBySemester)
        .flatMap((semesterStr) => {
          const semester = Number(semesterStr);
          const columnIndex = semesterColumnIndexMap.get(semester);
          if (columnIndex === undefined) return [];

          const coursesInSemester = coursesBySemester[semester].courses;
          return coursesInSemester.map((course, rowIndex) => {
            const nodeId = `${course.id}-${semester}-${rowIndex}`; // Unique ID

            if (!courseIdToNodeMap.has(course.id)) {
              courseIdToNodeMap.set(course.id, []);
            }
            courseIdToNodeMap.get(course.id)?.push({ nodeId, semester });

            return {
              id: nodeId,
              type: 'custom',
              position: {
                x: columnIndex * horizontalSpacing,
                y: rowIndex * verticalSpacing
              },
              data: {
                label: course.name,
                lv: course,
                onDelete: () => deleteCourse(course.id),
              },
            };
          });
        });

      const nodeIdToCourseMap = new Map(newNodes.map(node => [node.id, node.data.lv]));

      // iterate through all courses again to create edges
      const newEdges = [];
      for (const targetNode of newNodes) {
        const targetCourse = targetNode.data.lv;

        // Create a clean list of prerequisite IDs, regardless of the source data type
        let prerequisiteIds = [];
        if (targetCourse.prerequisites) {
          if (typeof targetCourse.prerequisites === 'string' && targetCourse.prerequisites.length > 0) {
            prerequisiteIds = targetCourse.prerequisites.split(';').map(id => id.trim());
          } else if (Array.isArray(targetCourse.prerequisites)) {
            prerequisiteIds = targetCourse.prerequisites.map(p => p.id);
          }
        }

        // loop over the clean array of IDs
        if (prerequisiteIds.length > 0) {
          for (const prereqId of prerequisiteIds) {
            const possibleSources = courseIdToNodeMap.get(prereqId);
            if (!possibleSources) continue; // skip if prerequisite node doesn't exist

            const bestSource = possibleSources
              .sort((a, b) => b.semester - a.semester)[0];

            if (bestSource && bestSource.nodeId !== targetNode.id) {
              const sourceCourse = nodeIdToCourseMap.get(bestSource.nodeId);

              // Ensure we found the source course before creating the edge
              if (sourceCourse) {
                newEdges.push({
                  id: `e-${bestSource.nodeId}-${targetNode.id}`,
                  type: 'custom',
                  source: bestSource.nodeId,
                  target: targetNode.id,
                  data: { sourceCourse: sourceCourse, targetCourse: targetCourse }
                });
              }
            }
          }
        }
      }

      // calculate the maximum height needed for the separators
      const maxCoursesInSemester = Math.max(
        ...Object.values(coursesBySemester).map((semesterData) => semesterData.courses.length)
      );

      // calculate total height from the top of the first node to the bottom of the last
      const verticalSeparatorHeight = (maxCoursesInSemester - 1) * verticalSpacing + 100;

      // create the separators
      const verticalSeparatorNodes = Array.from({ length: totalColumns - 1 })
        .map((_, index) => {
          const xPosition = (index + 0.75) * horizontalSpacing;
          return {
            id: `v-separator-${index}`,
            type: 'verticalSeparator',
            position: { x: xPosition, y: -50 },
            draggable: false,
            selectable: false,
            connectable: false,
            style: `height: ${verticalSeparatorHeight}px; width: 0.2rem;`,
            zIndex: -1
          };
        });

      // create the horizontal separator between semesters and courses
      const horizontalSeparatorNodes = Array.from({ length: totalColumns }).map((_, index) => {
        const xPosition = index * horizontalSpacing - (horizontalSpacing / 4);
        const yPosition = columnHeaderYPosition + 150;
        const lineWidth = horizontalSpacing / 15;

        return {
          id: `h-separator-${index}`,
          type: 'horizontalSeparator',
          position: { x: xPosition, y: yPosition },
          draggable: false,
          selectable: false,
          connectable: false,
          style: `height: 2rem; width: ${lineWidth}rem;`,
          zIndex: -1
        };
      });

      const addSemesterNode = {
        id: 'add-semester-button',
        type: 'addSemesterNode',
        position: {
          x: totalColumns * horizontalSpacing,
          y: columnHeaderYPosition
        },
        data: {
          onClick: addNewSemester
        },
        draggable: false,
        selectable: false,
        connectable: false,
        style: 'background: transparent; border: none;'
      };

      nodes = [
        ...headerNodes,
        ...newNodes,
        ...verticalSeparatorNodes,
        ...horizontalSeparatorNodes,
        addSemesterNode
      ];
      edges = newEdges;
    });

    function handleNodeDragStop(node: Node) {
      const draggedNode = node.targetNode;

      // only apply snapping to course nodes, not headers or separators
      if (draggedNode.type !== 'custom' || !draggedNode.position) {
        return;
      }

      // calculate the closest column index based on the node's final x position
      const closestColumnIndex = Math.round(draggedNode.position.x / horizontalSpacing);

      // get the list of semesters by looking at the header nodes already on the graph
      const sortedHeaders = nodes
        .filter(n => n.type === 'header')
        .sort((a, b) => a.position.x - b.position.x);

      const courseToMove = draggedNode.data.lv;
      const courseInStore = $curriculumStore.courses.find(c => c.id === courseToMove.id);
      if (!courseInStore) return;

      if (closestColumnIndex >= sortedHeaders.length) {
        const highestSemester = sortedHeaders.reduce((max, header) => {
          const semesterNum = parseInt(header.id.replace('header-', ''));
          return Math.max(max, semesterNum);
        }, 0);

        const newSemester = highestSemester + 1;

        courseInStore.recommended_semester = newSemester.toString();

        $curriculumStore.courses = [...$curriculumStore.courses];
      }
      else {
        const snappedX = closestColumnIndex * horizontalSpacing; // calculate the exact x-coordinate for that column
        const droppedY = draggedNode.position.y;

        const newHeaderNode = sortedHeaders[closestColumnIndex];
        const newSemester = parseInt(newHeaderNode.id.replace('header-', ''));
        const oldSemester = parseInt(courseInStore.recommended_semester);

        if (newSemester === oldSemester) {
          nodes = nodes.map(node =>
            node.id === draggedNode.id ? { ...node, position: { x: snappedX, y: droppedY } } : node
          );
          return;
        }

        const courseCredits = parseFloat(courseToMove.credits || 0);
        nodes = nodes.map(node => {
          if (node.id === draggedNode.id) {
            return { ...node, position: { x: snappedX, y: droppedY } };
          }
          if (node.id === `header-${oldSemester}`) {
            const newECTS = (node.data.semesterECTS || 0) - courseCredits;
            return { ...node, data: { ...node.data, semesterECTS: newECTS } };
          }
          if (node.id === `header-${newSemester}`) {
            const newECTS = (node.data.semesterECTS || 0) + courseCredits;
            return { ...node, data: { ...node.data, semesterECTS: newECTS } };
          }
          return node;
        });

        courseInStore.recommended_semester = newSemester.toString();
      }
    }

    // variables for graph controls
    let strokeWidth = $state(2);
    let strokeColor = $state('#000000');

    const deleteCourse = (courseId: string) => {
      const course = $curriculumStore.courses.find(c => c.id === courseId);
      if (course) {
        course.recommended_semester = "0";

        $curriculumStore.courses = [...$curriculumStore.courses];
      }
    };

    let courseToAdd = $state('');

    const availableCourses = $derived(
      $curriculumStore.courses
        .filter(c => {
          const sem = parseInt(c.recommended_semester);
          return isNaN(sem) || sem === 0;
        })
        .sort((a, b) => a.name.localeCompare(b.name))
    );

    const addCourse = (courseId: string) => {
      if (!courseId) return;

      const highestSemester = $curriculumStore.courses.reduce((max, course) => {
        const sem = parseInt(course.recommended_semester);
        return isNaN(sem) ? max : Math.max(max, sem);
      }, 1);

      const course = $curriculumStore.courses.find(c => c.id === courseId);

      if (course) {
        course.recommended_semester = highestSemester.toString();

        $curriculumStore.courses = [...$curriculumStore.courses];
      }

      courseToAdd = '';
    };

    function addNewSemester() {
      semesterCount ++;
    }
</script>

<div class="graph-wrapper">
  <div class="add-course">
    <form class="select-wrapper">
      <label>Add Course</label>
      <select bind:value={courseToAdd}>
        <option value="" disabled>Select Course...</option>
        {#each availableCourses.sort((a,b) => a.name > b.name) as c}
          <option value={c.id}>
            {c.name} {c.type} ({c.credits})
          </option>
        {/each}
      </select>
    </form>

    <button class="add-course-btn"
      onclick={() => addCourse(courseToAdd)}
      disabled={!courseToAdd}>
      <Plus size="1rem" />
    </button>
  </div>

  <div class="controls">
    <div class="stroke-control">
      <p>Stroke Width</p>
      <input type="range" min="1" max="10" bind:value={strokeWidth}/>
      <p>{strokeWidth}</p>
    </div>

    <div class="color-control">
      <p>Stroke Color</p>
      <input type="color" bind:value={strokeColor}/>
    </div>
  </div>

  <div class="tree-wrapper">
    <SvelteFlow
      bind:nodes
      bind:edges
      {nodeTypes}
      {edgeTypes}
      style="--stroke-width: {strokeWidth}; --stroke-color: {strokeColor};"
      onnodedragstop={handleNodeDragStop}
      viewport={customViewport}>
      <MiniMap />
      <Controls />
      <Background />
    </SvelteFlow>
  </div>
</div>


<style>
  .tree-wrapper {
    border: 3px solid lightgrey;
    border-radius: 1rem;
    padding: 0.5rem;
    height: 80vh;
  }

  .add-course {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    margin-bottom: 1rem;
    font-weight: 600;

    /* Select Dropdown */
    .select-wrapper {
      position: relative;
    }

    .select-wrapper::after {
      content: '';
      position: absolute;
      right: 1rem;
      bottom: 1rem;
      width: 0;
      height: 0;
      border-left: 0.3rem solid transparent;
      border-right: 0.3rem solid transparent;
      border-top: 0.4rem solid var(--color-text-muted);
      pointer-events: none;
    }

    .add-course-btn {
      border: none;
      color: white;
      cursor: pointer;
      border-radius: 0.4rem;
      background-color: var(--color-primary);
      transition: all 0.2s ease-in-out;
      padding: 0.2rem 0.3rem;
    }

    .add-course-btn:disabled {
      background-color: lightgrey;
      cursor: not-allowed;
      transform: none;
    }

    .add-course-btn:disabled {
      background-color: #7f8c8d;
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .controls {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: auto;
    right: 2rem;
    backdrop-filter: blur(1rem);
    border-radius: 1rem;
    z-index: 10;
    margin: 1rem;
    font-size: 0.8rem;
    border: 3px solid lightgrey;
  }

  .stroke-control {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.3rem 0.5rem;
    gap: 0.3rem;
  }

  .color-control {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.3rem 0.5rem;
    gap: 0.3rem;
  }

  :global(.svelte-flow__edge-path) {
    stroke: var(--stroke-color);
    stroke-width: var(--stroke-width);
  }
  :global(.svelte-flow__edge.selected .svelte-flow__edge-path) {
    stroke: black;
  }
  :global(.svelte-flow__edge-label) {
    background: transparent;
    backdrop-filter: blur(1rem);
    border-radius: 0.5rem;
    border: 0.1rem solid black;
    padding: 0.5rem;
  }
</style>
